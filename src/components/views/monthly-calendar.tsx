"use client";

import { useState } from "react";
import { TaskRow } from "@/components/tasks/task-row";
import { PeriodNav } from "@/components/ui/period-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { useMonthNav } from "@/hooks/use-month-nav";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "@/lib/utils";
import type { Task } from "@/types";

interface MonthlyCalendarProps {
  initialTasks: Task[];
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_DOTS = 3;

export function MonthlyCalendar({ initialTasks }: MonthlyCalendarProps) {
  const { year, month, label, isCurrentMonth, prev, next, reset } = useMonthNav();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  // Shift so week starts Monday (0=Mon … 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  // Group tasks by ISO date
  const tasksByDay = new Map<string, Task[]>();
  for (const task of initialTasks) {
    if (!task.dueDate) continue;
    const key = new Date(task.dueDate).toISOString().split("T")[0];
    if (!tasksByDay.has(key)) tasksByDay.set(key, []);
    tasksByDay.get(key)!.push(task);
  }

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  // Selected day tasks
  const selectedTasks = selectedDay ? (tasksByDay.get(selectedDay) ?? []) : [];
  const selectedDateLabel = selectedDay
    ? new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Nav */}
      <PeriodNav
        label={label}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        showReset={!isCurrentMonth}
      />

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="pb-1 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalCells }, (_, idx) => {
          const dayNum = idx - startDow + 1;
          const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;

          if (!isValidDay) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const date = new Date(year, month, dayNum);
          const key = date.toISOString().split("T")[0];
          const dayTasks = tasksByDay.get(key) ?? [];
          const isCurrentDay = key === todayKey;
          const isPast = date < today && !isCurrentDay;
          const isSelected = key === selectedDay;

          const activeTasks = dayTasks.filter(
            (t) => t.status !== "DONE" && t.status !== "CANCELLED"
          );
          const doneTasks = dayTasks.filter((t) => t.status === "DONE");

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${dayTasks.length} task${dayTasks.length !== 1 ? "s" : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-center rounded-lg p-1 pt-1.5 transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "cursor-pointer select-none min-h-[52px]",
                isCurrentDay
                  ? "bg-primary text-white"
                  : isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted bg-card border border-border",
                isPast && !isSelected && !isCurrentDay && "opacity-50"
              )}
            >
              {/* Day number */}
              <span className={cn(
                "text-xs font-semibold leading-none",
                isCurrentDay ? "text-white" : "text-foreground"
              )}>
                {dayNum}
              </span>

              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div className="mt-1.5 flex items-center gap-0.5 flex-wrap justify-center">
                  {activeTasks.slice(0, MAX_DOTS).map((task) => (
                    <span
                      key={task.id}
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isCurrentDay
                          ? "rgba(255,255,255,0.8)"
                          : task.person?.color ?? "var(--color-primary)",
                      }}
                      aria-hidden
                    />
                  ))}
                  {activeTasks.length > MAX_DOTS && (
                    <span className={cn(
                      "text-[9px] font-medium leading-none",
                      isCurrentDay ? "text-white/80" : "text-muted-foreground"
                    )}>
                      +{activeTasks.length - MAX_DOTS}
                    </span>
                  )}
                  {doneTasks.length > 0 && activeTasks.length === 0 && (
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full bg-success/40",
                    )} aria-hidden />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day task list */}
      {selectedDay && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{selectedDateLabel}</h3>
            <span className="text-xs text-muted-foreground">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {selectedTasks.length > 0 ? (
            <div className="p-2 space-y-0.5">
              {selectedTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No tasks this day.</p>
          )}
        </div>
      )}

      {/* Empty state — only if no tasks at all */}
      {initialTasks.length === 0 && (
        <EmptyState
          icon={CalendarRange}
          title="Nothing scheduled this month"
          description="Add tasks with a due date to see them here."
        />
      )}
    </div>
  );
}
