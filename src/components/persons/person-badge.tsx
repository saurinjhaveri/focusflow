import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface PersonBadgeProps {
  person: Person;
  className?: string;
}

export function PersonBadge({ person, className }: PersonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${person.color}18`,
        color: person.color,
        border: `1px solid ${person.color}30`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: person.color }}
        aria-hidden
      />
      {person.name}
    </span>
  );
}
