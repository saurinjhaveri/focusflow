"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Bell, MoreHorizontal, Trash2 } from "lucide-react";
import { TaskStatusToggle } from "./task-status-toggle";
import { PriorityDot } from "@/components/ui/priority-badge";
import { PersonBadge } from "@/components/persons/person-badge";
import { Button } from "@/components/ui/button";
import { deleteTask } from "@/lib/actions/tasks";
import { formatDate, isOverdue, isToday, isTomorrow } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { useTransition } from "react";

interface TaskCardProps {
  task: Task;
  variant?: "default" | "overdue" | "compact";
}

export function TaskCard({ task, variant = "default" }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDone = task.status === "DONE";
  const overdueDate = task.dueDate && isOverdue(task.dueDate) && !isDone;
  const pendingFollowUps = task.followUps.filter((f) => !f.done);

  function handleDelete() {
    setShowMenu(false);
    startTransition(() => deleteTask(task.id));
  }

  function dueDateLabel() {
    if (!task.dueDate) return null;
    if (isOverdue(task.dueDate) && !isDone)
      return { text: `Overdue · ${formatDate(task.dueDate)}`, cls: "text-accent font-medium" };
    if (isToday(task.dueDate))
      return { text: "Today", cls: "text-primary font-medium" };
    if (isTomorrow(task.dueDate))
      return { text: "Tomorrow", cls: "text-warning font-medium" };
    return { text: formatDate(task.dueDate), cls: "text-muted-foreground" };
  }

  const dateLabel = dueDateLabel();

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card transition-shadow duration-150",
        "hover:shadow-sm",
        variant === "overdue" ? "border-accent/30 bg-accent/[0.02]" : "border-border",
        isDone && "opacity-60",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Overdue left accent */}
      {variant === "overdue" && (
        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-accent" aria-hidden />
      )}

      <div className="flex items-start gap-3 p-3.5">
        {/* Status toggle */}
        <div className="pt-0.5">
          <TaskStatusToggle taskId={task.id} status={task.status} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium text-foreground leading-snug",
                isDone && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>

            {/* Actions — visible on hover / focus */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <PriorityDot priority={task.priority} />

              {/* More menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="Task options"
                  aria-expanded={showMenu}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                </Button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                      aria-hidden
                    />
                    <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-border bg-card shadow-lg py-1 animate-fade-in">
                      <button
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {dateLabel && (
              <span className={cn("flex items-center gap-1 text-xs", dateLabel.cls)}>
                <Clock className="h-3 w-3" aria-hidden />
                {dateLabel.text}
              </span>
            )}

            {task.person && <PersonBadge person={task.person} />}

            {pendingFollowUps.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-primary bg-primary/8 rounded-full px-2 py-0.5">
                <Bell className="h-3 w-3" aria-hidden />
                {pendingFollowUps.length} follow-up{pendingFollowUps.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Expand: notes */}
          {task.notes && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide notes" : "Show notes"}
            </button>
          )}

          {expanded && task.notes && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-muted rounded-lg px-3 py-2 animate-fade-in">
              {task.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
