"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { completeTask, reopenTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

interface TaskStatusToggleProps {
  taskId: string;
  status: TaskStatus;
}

export function TaskStatusToggle({ taskId, status }: TaskStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = status === "DONE";

  function handleToggle() {
    startTransition(async () => {
      if (isDone) {
        await reopenTask(taskId);
      } else {
        await completeTask(taskId);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
      className={cn(
        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
        "transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "active:scale-90",
        isDone
          ? "border-success bg-success text-white"
          : "border-border hover:border-primary hover:bg-primary/5",
        isPending && "opacity-50"
      )}
    >
      {isDone && <Check className="h-3 w-3" aria-hidden strokeWidth={3} />}
    </button>
  );
}
