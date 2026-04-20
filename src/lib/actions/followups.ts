"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getPendingFollowUps() {
  return prisma.followUp.findMany({
    where: { done: false },
    include: {
      task: {
        include: { person: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getTodayFollowUps() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return prisma.followUp.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      done: false,
    },
    include: {
      task: { include: { person: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getOverdueFollowUps() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return prisma.followUp.findMany({
    where: {
      scheduledAt: { lt: now },
      done: false,
    },
    include: {
      task: { include: { person: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createFollowUp(data: {
  taskId: string;
  scheduledAt: Date;
  note?: string;
}) {
  const followUp = await prisma.followUp.create({
    data,
    include: { task: { include: { person: true } } },
  });

  revalidatePath("/");
  revalidatePath("/followups");
  return followUp;
}

export async function completeFollowUp(id: string) {
  const followUp = await prisma.followUp.update({
    where: { id },
    data: { done: true, completedAt: new Date() },
    include: { task: { include: { person: true } } },
  });

  revalidatePath("/");
  revalidatePath("/followups");
  return followUp;
}

export async function snoozeFollowUp(id: string, newDate: Date) {
  const followUp = await prisma.followUp.update({
    where: { id },
    data: { scheduledAt: newDate },
    include: { task: { include: { person: true } } },
  });

  revalidatePath("/");
  revalidatePath("/followups");
  return followUp;
}

export async function deleteFollowUp(id: string) {
  await prisma.followUp.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/followups");
}
