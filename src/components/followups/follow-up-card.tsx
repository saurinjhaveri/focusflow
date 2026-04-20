"use client";

import { useTransition } from "react";
import { Check, Clock, ArrowRight } from "lucide-react";
import { completeFollowUp } from "@/lib/actions/followups";
import { PersonAvatar } from "@/components/persons/person-avatar";
import { Button } from "@/components/ui/button";
import { formatDate, isOverdue, isToday } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FollowUp } from "@/types";

interface FollowUpCardProps {
  followUp: FollowUp & {
    task: {
      id: string;
      title: string;
      person: { name: string; color: string } | null;
    };
  };
}

export function FollowUpCard({ followUp }: FollowUpCardProps) {
  const [isPending, startTransition] = useTransition();
  const overdue = isOverdue(followUp.scheduledAt);
  const today = isToday(followUp.scheduledAt);

  function handleComplete() {
    startTransition(async () => { await completeFollowUp(followUp.id); });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 transition-all",
        overdue ? "border-accent/30" : "border-border",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={isPending}
        aria-label="Mark follow-up complete"
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2",
          "transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "active:scale-90 hover:border-primary hover:bg-primary/5",
          overdue ? "border-accent" : "border-border"
        )}
      >
        <Check className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs mb-0.5">
          <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" aria-hidden />
          <span className="font-medium text-foreground truncate">{followUp.task.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1 text-xs",
            overdue ? "text-accent font-medium" : today ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            <Clock className="h-3 w-3" aria-hidden />
            {overdue ? `Overdue · ${formatDate(followUp.scheduledAt)}` : today ? "Today" : formatDate(followUp.scheduledAt)}
          </span>

          {followUp.note && (
            <span className="text-xs text-muted-foreground truncate">· {followUp.note}</span>
          )}
        </div>
      </div>

      {/* Person avatar */}
      {followUp.task.person && (
        <PersonAvatar
          name={followUp.task.person.name}
          color={followUp.task.person.color}
          size="sm"
        />
      )}
    </div>
  );
}
