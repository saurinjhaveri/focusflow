import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  URGENT: { label: "Urgent", className: "bg-urgent/10 text-urgent border border-urgent/20" },
  HIGH:   { label: "High",   className: "bg-high/10 text-high border border-high/20" },
  MEDIUM: { label: "Medium", className: "bg-medium/10 text-medium border border-medium/20" },
  LOW:    { label: "Low",    className: "bg-low/10 text-low border border-low/20" },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
}

export function PriorityBadge({ priority, className, showLabel = true }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
      aria-label={`Priority: ${config.label}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {showLabel && config.label}
    </span>
  );
}

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  const colors: Record<Priority, string> = {
    URGENT: "bg-urgent",
    HIGH:   "bg-high",
    MEDIUM: "bg-medium",
    LOW:    "bg-low",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full flex-shrink-0", colors[priority], className)}
      aria-label={`Priority: ${priority.toLowerCase()}`}
    />
  );
}
