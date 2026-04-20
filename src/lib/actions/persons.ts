"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const PERSON_COLORS = [
  "#0D9488", "#7C3AED", "#EA580C", "#2563EB",
  "#DB2777", "#059669", "#D97706", "#0891B2",
  "#9333EA", "#16A34A",
];

export async function getPersons() {
  return prisma.person.findMany({ orderBy: { name: "asc" } });
}

export async function createPerson(data: { name: string; color?: string }) {
  let color = data.color;
  if (!color) {
    const existing = await prisma.person.findMany({ select: { color: true } });
    const usedColors = new Set(existing.map((p) => p.color));
    color = PERSON_COLORS.find((c) => !usedColors.has(c)) ?? PERSON_COLORS[0];
  }

  const person = await prisma.person.create({ data: { name: data.name, color } });
  revalidatePath("/team");
  revalidatePath("/settings");
  return person;
}

export async function updatePerson(
  id: string,
  data: Partial<{ name: string; color: string }>
) {
  const person = await prisma.person.update({ where: { id }, data });
  revalidatePath("/team");
  revalidatePath("/settings");
  return person;
}

export async function deletePerson(id: string) {
  await prisma.person.delete({ where: { id } });
  revalidatePath("/team");
  revalidatePath("/settings");
}
