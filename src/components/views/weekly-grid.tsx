"use client";

import { useTransition } from "react";
import { TaskRow } from "@/components/tasks/task-row";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodNav } from "@/components/ui/period-nav";
import { useWeekNav } from "@/hooks/use-week-nav";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, isOverdue } from "@/lib/utils";
import type { Task } from "@/types";

interface WeeklyGridProps {
  initialTasks: Task[];
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyGrid({ initialTasks }: WeeklyGridProps) {
  const { weekStart, days, label, isCurrentWeek, prev, next, reset } = useWeekNav();

  // Group tasks by day ISO string
  const tasksByDay = new Map<string, Task[]>();
  for (const task of initialTasks) {
    if (!task.dueDate) continue;
    const key = new Date(task.dueDate).toISOString().split("T")[0];
    if (!tasksByDay.has(key)) tasksByDay.set(key, []);
    tasksByDay.get(key)!.push(task);
  }

  const totalTasks = initialTasks.filter(
    (t) => t.status !== "DONE" && t.status !== "CANCELLED"
  ).length;

  return (
    <div className="space-y-4">
      {/* Nav */}
      <PeriodNav
        label={label}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        showReset={!isCurrentWeek}
      />

      {/* Mobile: vertical day list */}
      <div className="md:hidden space-y-3">
        {days.map((day, i) => {
          const key = day.toISOString().split("T")[0];
          const dayTasks = tasksByDay.get(key) ?? [];
          const todayDay = isToday(day);
          const isPast = day < new Date() && !todayDay;

          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border bg-card overflow-hidden",
                todayDay ? "border-primary/40" : "border-border",
                isPast && "opacity-70"
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 border-b",
                  todayDay
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      todayDay ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {DAY_NAMES[i]}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      todayDay ? "font-bold text-primary" : "text-foreground"
                    )}
                  >
                    {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {todayDay && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                      Today
                    </span>
                  )}
                </div>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Tasks */}
              <div className="p-1">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))
                ) : (
                  <p className="px-3 py-2.5 text-xs text-muted-foreground/60">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {/* Column headers */}
        {days.map((day, i) => {
          const todayDay = isToday(day);
          return (
            <div key={`h-${i}`} className="text-center pb-1">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide",
                todayDay ? "text-primary" : "text-muted-foreground"
              )}>
                {DAY_NAMES[i]}
              </span>
              <div className={cn(
                "mt-0.5 text-sm font-semibold",
                todayDay ? "text-primary" : "text-foreground"
              )}>
                {day.getDate()}
              </div>
            </div>
          );
        })}

        {/* Task columns */}
        {days.map((day, i) => {
          const key = day.toISOString().split("T")[0];
          const dayTasks = tasksByDay.get(key) ?? [];
          const todayDay = isToday(day);
          const isPast = day < new Date() && !todayDay;

          return (
            <div
              key={`col-${i}`}
              className={cn(
                "rounded-xl border min-h-24 p-1.5",
                todayDay ? "border-primary/30 bg-primary/[0.02]" : "border-border bg-card",
                isPast && "opacity-60"
              )}
            >
              {dayTasks.length > 0 ? (
                <div className="space-y-0.5">
                  {dayTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-start justify-center pt-3">
                  <span className="text-[10px] text-muted-foreground/40">—</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {totalTasks === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Nothing scheduled this week"
          description="Add tasks with a due date to see them here."
        />
      )}
    </div>
  );
}
