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

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter(
    (t) => t.status !== "DONE" && t.status !== "CANCELLED"
  );

  return (
    <section
      aria-labelledby="unassigned-group"
      className="rounded-xl border border-border overflow-hidden"
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
            <span className="text-xs text-muted-foreground">
              {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
            </span>
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
        <div id="unassigned-group-body" className="p-3 space-y-2 animate-fade-in">
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
