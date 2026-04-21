"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface UnassignedGroupProps {
  tasks: Task[];
}

export function UnassignedGroup({ tasks }: UnassignedGroupProps) {
  const [open, setOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const activeTasks = tasks.filter(
    (t) => t.status !== "DONE" && t.status !== "CANCELLED"
  );
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  if (activeTasks.length === 0 && doneTasks.length === 0) return null;

  return (
    <section
      aria-labelledby="unassigned-group"
      className="rounded-xl border border-border"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={open}
        aria-controls="unassigned-group-body"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
            <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="text-left">
            <h2 id="unassigned-group" className="text-sm font-semibold text-foreground">
              Unassigned
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

      {open && (
        <div id="unassigned-group-body" className="divide-y divide-border/50 animate-fade-in">
          {activeTasks.length > 0 && (
            <div className="p-3 space-y-2">
              {activeTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="px-3 py-2">
              <button
                onClick={() => setDoneOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-expanded={doneOpen}
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-150",
                    doneOpen && "rotate-180"
                  )}
                  aria-hidden
                />
                {doneTasks.length} completed task{doneTasks.length > 1 ? "s" : ""}
              </button>
              {doneOpen && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  {doneTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTasks.length === 0 && doneTasks.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No tasks assigned.</p>
          )}
        </div>
      )}
    </section>
  );
}
