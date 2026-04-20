import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "overdue" | "followup";
  icon?: LucideIcon;
  id?: string;
}

const TITLE_STYLES = {
  default:  "text-foreground",
  overdue:  "text-accent",
  followup: "text-primary",
};

const COUNT_STYLES = {
  default:  "bg-muted text-muted-foreground",
  overdue:  "bg-accent/10 text-accent",
  followup: "bg-primary/10 text-primary",
};

const ICON_STYLES = {
  default:  "text-muted-foreground",
  overdue:  "text-accent",
  followup: "text-primary",
};

export function SectionHeader({
  title, count, action, className, variant = "default", icon: Icon, id,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className={cn("h-4 w-4 flex-shrink-0", ICON_STYLES[variant])} aria-hidden />
        )}
        <h2
          id={id}
          className={cn("text-sm font-semibold", TITLE_STYLES[variant])}
        >
          {title}
        </h2>
        {count !== undefined && (
          <span className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
            COUNT_STYLES[variant]
          )}>
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
