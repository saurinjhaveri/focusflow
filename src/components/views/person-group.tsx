"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { PersonAvatar } from "@/components/persons/person-avatar";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface PersonGroupProps {
  personId: string;
  personName: string;
  color: string;
  tasks: Task[];
  defaultOpen?: boolean;
}

export function PersonGroup({
  personId,
  personName,
  color,
  tasks,
  defaultOpen = true,
}: PersonGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const activeTasks = tasks.filter(
    (t) => t.status !== "DONE" && t.status !== "CANCELLED"
  );
  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const overdueCount = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;

  return (
    <section
      aria-labelledby={`person-group-${personId}`}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      {/* Color-coded header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "transition-colors duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
          "hover:opacity-90"
        )}
        style={{ backgroundColor: `${color}12` }}
        aria-expanded={open}
        aria-controls={`person-group-body-${personId}`}
      >
        <div className="flex items-center gap-3">
          <PersonAvatar name={personName} color={color} size="md" />
          <div className="text-left">
            <h2
              id={`person-group-${personId}`}
              className="text-sm font-semibold text-foreground"
            >
              {personName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {activeTasks.length} active
              </span>
              {doneTasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  · {doneTasks.length} done
                </span>
              )}
              {overdueCount > 0 && (
                <span
                  className="text-xs font-medium rounded-full px-1.5 py-0.5"
                  style={{
                    backgroundColor: "rgba(234,88,12,0.1)",
                    color: "#EA580C",
                  }}
                >
                  {overdueCount} overdue
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-90"
          )}
          aria-hidden
        />
      </button>

      {/* Task list */}
      {open && (
        <div
          id={`person-group-body-${personId}`}
          className="divide-y divide-border/50 animate-fade-in"
        >
          {/* Active tasks */}
          {activeTasks.length > 0 && (
            <div className="p-3 space-y-2">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant={
                    task.dueDate && new Date(task.dueDate) < new Date()
                      ? "overdue"
                      : "default"
                  }
                />
              ))}
            </div>
          )}

          {/* Done tasks — collapsed by default */}
          {doneTasks.length > 0 && (
            <DoneTasksSection tasks={doneTasks} color={color} />
          )}

          {activeTasks.length === 0 && doneTasks.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No tasks assigned.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function DoneTasksSection({ tasks, color }: { tasks: Task[]; color: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden
        />
        {tasks.length} completed task{tasks.length > 1 ? "s" : ""}
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
