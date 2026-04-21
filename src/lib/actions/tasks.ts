"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Priority, TaskStatus, TaskFilters } from "@/types";
import { parser } from "@/lib/parser";

// ── Shared include for consistent shape ──────────────────────────────────────
const taskInclude = {
  person: true,
  taskPersons: { include: { person: true } },
  tags: { include: { tag: true } },
  followUps: { orderBy: { scheduledAt: "asc" as const } },
} as const;

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay())); weekEnd.setHours(23, 59, 59, 999);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [overdue, dueThisWeek, dueThisMonth] = await Promise.all([
    prisma.task.count({ where: { dueDate: { lt: todayStart }, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    prisma.task.count({ where: { dueDate: { gte: todayStart, lte: weekEnd }, status: { not: "CANCELLED" } } }),
    prisma.task.count({ where: { dueDate: { gte: todayStart, lte: monthEnd }, status: { not: "CANCELLED" } } }),
  ]);

  return { overdue, dueThisWeek, dueThisMonth };
}

export async function getTasks(filters: TaskFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  } else {
    // Default: exclude cancelled
    where.status = { not: "CANCELLED" };
  }

  if (filters.personId) where.personId = filters.personId;
  if (filters.priority) where.priority = filters.priority;
  if (filters.search) {
    where.title = { contains: filters.search };
  }

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTodayTasks() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [overdue, today] = await Promise.all([
    // Overdue: dueDate before today, not done/cancelled
    prisma.task.findMany({
      where: {
        dueDate: { lt: start },
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      include: taskInclude,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
    // Today: dueDate within today
    prisma.task.findMany({
      where: {
        dueDate: { gte: start, lte: end },
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      include: taskInclude,
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  return { overdue, today };
}

export async function getWeeklyTasks(weekStart: Date, weekEnd?: Date) {
  const end = weekEnd ?? (() => {
    const e = new Date(weekStart);
    e.setDate(weekStart.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
  })();

  return prisma.task.findMany({
    where: {
      dueDate: { gte: weekStart, lte: end },
      status: { not: "CANCELLED" },
    },
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });
}

export async function getMonthlyTasks(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return prisma.task.findMany({
    where: {
      dueDate: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });
}

export async function getUpcomingTasks(limit = 5) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return prisma.task.findMany({
    where: {
      dueDate: { gte: start },
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    take: limit,
  });
}

export async function getTasksByPerson() {
  const persons = await prisma.person.findMany({
    include: {
      // primary-person tasks
      tasks: {
        where: { status: { not: "CANCELLED" } },
        include: taskInclude,
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      },
      // additional-person tasks via join table
      taskPersons: {
        include: {
          task: { include: taskInclude },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Merge both sets, deduplicate by task id
  return persons.map((p) => {
    const primaryIds = new Set(p.tasks.map(t => t.id));
    const extra = p.taskPersons
      .map(tp => tp.task)
      .filter(t => t && t.status !== "CANCELLED" && !primaryIds.has(t.id));
    return { ...p, tasks: [...p.tasks, ...(extra as any[])] };
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createTask(data: {
  title: string;
  rawInput?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date | null;
  notes?: string;
  personId?: string | null;
  tagNames?: string[];
  followUpDate?: Date;
}) {
  const { tagNames, followUpDate, ...rest } = data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      tags: tagNames?.length
        ? {
            create: await resolveTagConnections(tagNames),
          }
        : undefined,
      followUps: followUpDate
        ? {
            create: [{ scheduledAt: followUpDate }],
          }
        : undefined,
    },
    include: taskInclude,
  });

  revalidatePath("/");
  revalidatePath("/weekly");
  revalidatePath("/monthly");
  revalidatePath("/team");
  return task;
}

export async function createTaskFromText(raw: string) {
  const [parsed, { persons }] = await Promise.all([
    Promise.resolve(parser.parse(raw)),
    detectPersonsInText(raw),
  ]);

  const personId = persons[0]?.id ?? null;
  const additionalPersonIds = persons.slice(1).map(p => p.id);

  const task = await createTask({
    title: parsed.title,
    rawInput: raw,
    priority: parsed.priority ?? "MEDIUM",
    dueDate: parsed.dueDate ?? null,
    personId,
    tagNames: parsed.tags,
    followUpDate: parsed.followUpDate,
  });

  // Link additional persons via join table
  if (additionalPersonIds.length > 0) {
    await prisma.taskPerson.createMany({
      data: additionalPersonIds.map((personId) => ({ taskId: task.id, personId })),
    });
  }

  return task;
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
    notes: string;
    personId: string | null;
    completedAt: Date | null;
  }>
) {
  const task = await prisma.task.update({
    where: { id },
    data,
    include: taskInclude,
  });

  revalidatePath("/");
  revalidatePath("/weekly");
  revalidatePath("/team");
  return task;
}

export async function completeTask(id: string) {
  return updateTask(id, {
    status: "DONE",
    completedAt: new Date(),
  });
}

export async function reopenTask(id: string) {
  return updateTask(id, {
    status: "TODO",
    completedAt: null,
  });
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/weekly");
  revalidatePath("/team");
}

// ── Person helpers ────────────────────────────────────────────────────────────

const MAX_TASK_PERSONS = 4;

/**
 * Scan raw text for any known team member names (word-boundary, case-insensitive).
 * Returns matched persons capped at MAX_TASK_PERSONS, in the order they appear in DB.
 */
export async function detectPersonsInText(raw: string) {
  const allPersons = await prisma.person.findMany({ select: { id: true, name: true } });
  const matched = allPersons.filter(({ name }) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(raw);
  });
  return {
    persons: matched.slice(0, MAX_TASK_PERSONS),
    limitExceeded: matched.length > MAX_TASK_PERSONS,
  };
}

// ── Tag helpers ───────────────────────────────────────────────────────────────

async function resolveTagConnections(tagNames: string[]) {
  return Promise.all(
    tagNames.map(async (name) => {
      const tag = await prisma.tag.upsert({
        where: { name: name.toLowerCase() },
        update: {},
        create: { name: name.toLowerCase() },
      });
      return { tag: { connect: { id: tag.id } } };
    })
  );
}
