"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { PriorityDot } from "@/components/ui/priority-badge";
import { PersonAvatar } from "@/components/persons/person-avatar";
import { completeTask, reopenTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "DONE";

  function handleToggle() {
    startTransition(async () => {
      if (isDone) await reopenTask(task.id);
      else await completeTask(task.id);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
        "transition-colors duration-100 hover:bg-muted/50 group",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Toggle */}
      <button
        onClick={handleToggle}
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
          "transition-all duration-150 cursor-pointer active:scale-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isDone
            ? "border-success bg-success"
            : "border-border group-hover:border-primary"
        )}
      >
        {isDone && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden />}
      </button>

      {/* Priority dot */}
      <PriorityDot priority={task.priority} className="flex-shrink-0" />

      {/* Title */}
      <span
        className={cn(
          "flex-1 text-xs text-foreground truncate leading-snug",
          isDone && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>

      {/* Person */}
      {task.person && (
        <PersonAvatar
          name={task.person.name}
          color={task.person.color}
          size="sm"
          className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );
}
