import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FocusFlow...");

  // ─── Clean ────────────────────────────────────────────────────────────────
  await prisma.followUp.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.person.deleteMany();

  // ─── Persons ──────────────────────────────────────────────────────────────
  const persons = await Promise.all([
    prisma.person.create({ data: { name: "Rajan", color: "#0D9488" } }),
    prisma.person.create({ data: { name: "Priya", color: "#7C3AED" } }),
    prisma.person.create({ data: { name: "Sam", color: "#EA580C" } }),
    prisma.person.create({ data: { name: "Alex", color: "#2563EB" } }),
  ]);

  const [rajan, priya, sam] = persons;

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "proposal", color: "#0D9488" } }),
    prisma.tag.create({ data: { name: "client", color: "#7C3AED" } }),
    prisma.tag.create({ data: { name: "internal", color: "#64748B" } }),
    prisma.tag.create({ data: { name: "urgent", color: "#DC2626" } }),
    prisma.tag.create({ data: { name: "review", color: "#D97706" } }),
  ]);

  const [proposalTag, clientTag, internalTag, urgentTag, reviewTag] = tags;

  // ─── Tasks ────────────────────────────────────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const today = new Date(now); today.setHours(18, 0, 0, 0);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const in3Days = new Date(now); in3Days.setDate(now.getDate() + 3);
  const in7Days = new Date(now); in7Days.setDate(now.getDate() + 7);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);

  // Overdue task
  const task1 = await prisma.task.create({
    data: {
      title: "Send updated proposal to Rajan",
      rawInput: "send updated proposal to Rajan by yesterday urgent",
      status: "TODO",
      priority: "URGENT",
      dueDate: yesterday,
      personId: rajan.id,
      tags: {
        create: [
          { tag: { connect: { id: proposalTag.id } } },
          { tag: { connect: { id: urgentTag.id } } },
        ],
      },
    },
  });

  // Today task
  const task2 = await prisma.task.create({
    data: {
      title: "Review Q2 budget with Priya",
      rawInput: "review Q2 budget with Priya today",
      status: "TODO",
      priority: "HIGH",
      dueDate: today,
      personId: priya.id,
      tags: { create: [{ tag: { connect: { id: internalTag.id } } }] },
    },
  });

  // Today task with follow-up
  const task3 = await prisma.task.create({
    data: {
      title: "Call Sam about the onboarding flow",
      rawInput: "call Sam about onboarding flow today follow up Friday",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: today,
      personId: sam.id,
      tags: { create: [{ tag: { connect: { id: clientTag.id } } }] },
    },
  });

  // Tomorrow task
  const task4 = await prisma.task.create({
    data: {
      title: "Prepare slides for product demo",
      rawInput: "prepare slides for product demo by tomorrow",
      status: "TODO",
      priority: "HIGH",
      dueDate: tomorrow,
      tags: { create: [{ tag: { connect: { id: reviewTag.id } } }] },
    },
  });

  // In 3 days
  const task5 = await prisma.task.create({
    data: {
      title: "Submit expense report",
      rawInput: "submit expense report by Thursday internal",
      status: "TODO",
      priority: "LOW",
      dueDate: in3Days,
      tags: { create: [{ tag: { connect: { id: internalTag.id } } }] },
    },
  });

  // Next week with follow-up
  const task6 = await prisma.task.create({
    data: {
      title: "Finalize contract with client",
      rawInput: "finalize contract with Rajan next week follow up in 2 days",
      status: "TODO",
      priority: "HIGH",
      dueDate: in7Days,
      personId: rajan.id,
      tags: {
        create: [
          { tag: { connect: { id: clientTag.id } } },
          { tag: { connect: { id: proposalTag.id } } },
        ],
      },
    },
  });

  // Completed task
  await prisma.task.create({
    data: {
      title: "Set up project repository",
      rawInput: "set up project repo",
      status: "DONE",
      priority: "MEDIUM",
      completedAt: yesterday,
      tags: { create: [{ tag: { connect: { id: internalTag.id } } }] },
    },
  });

  // ─── Follow-Ups ───────────────────────────────────────────────────────────
  const followUpToday = new Date(now); followUpToday.setHours(17, 0, 0, 0);
  const followUpTomorrow = new Date(tomorrow);
  const followUpIn3 = new Date(in3Days);

  await prisma.followUp.create({
    data: {
      taskId: task1.id,
      scheduledAt: followUpToday,
      note: "Check if Rajan received the previous draft",
    },
  });

  await prisma.followUp.create({
    data: {
      taskId: task3.id,
      scheduledAt: followUpTomorrow,
      note: "Check in on Sam's progress with onboarding",
    },
  });

  await prisma.followUp.create({
    data: {
      taskId: task6.id,
      scheduledAt: followUpIn3,
      note: "Confirm contract terms before finalizing",
    },
  });

  // Done follow-up
  await prisma.followUp.create({
    data: {
      taskId: task2.id,
      scheduledAt: yesterday,
      note: "Pre-meeting sync",
      done: true,
      completedAt: yesterday,
    },
  });

  console.log(`✅ Seeded:`);
  console.log(`   ${persons.length} persons`);
  console.log(`   ${tags.length} tags`);
  console.log(`   7 tasks (1 overdue, 2 today, 1 tomorrow, 1 next week, 1 done)`);
  console.log(`   4 follow-ups (3 pending, 1 done)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
