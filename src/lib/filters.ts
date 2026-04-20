import type { Task, Priority, TaskStatus } from "@/types";
import { isToday, isOverdue, getStartOfWeek, getEndOfWeek } from "./utils";

export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function filterByPerson(tasks: Task[], personId: string): Task[] {
  return tasks.filter((t) => t.personId === personId);
}

export function filterByPriority(tasks: Task[], priority: Priority): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

export function filterOverdue(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      t.dueDate &&
      isOverdue(t.dueDate) &&
      t.status !== "DONE" &&
      t.status !== "CANCELLED"
  );
}

export function filterToday(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      t.dueDate &&
      isToday(t.dueDate) &&
      t.status !== "DONE" &&
      t.status !== "CANCELLED"
  );
}

export function filterThisWeek(tasks: Task[]): Task[] {
  const start = getStartOfWeek();
  const end = getEndOfWeek();
  return tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= start &&
      new Date(t.dueDate) <= end &&
      t.status !== "CANCELLED"
  );
}

export function groupByDate(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.dueDate) {
      (acc["no-date"] ??= []).push(task);
    } else {
      const key = new Date(task.dueDate).toISOString().split("T")[0];
      (acc[key] ??= []).push(task);
    }
    return acc;
  }, {});
}

export function groupByPerson(
  tasks: Task[]
): Record<string, { tasks: Task[]; personName: string; color: string }> {
  return tasks.reduce<
    Record<string, { tasks: Task[]; personName: string; color: string }>
  >((acc, task) => {
    const key = task.personId ?? "unassigned";
    if (!acc[key]) {
      acc[key] = {
        tasks: [],
        personName: task.person?.name ?? "Unassigned",
        color: task.person?.color ?? "#64748B",
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});
}

const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}

export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}
