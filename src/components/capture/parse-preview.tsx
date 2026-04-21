import { Calendar, Bell, User, Tag, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { cn } from "@/lib/utils";
import type { ParsedTask } from "@/lib/parser/types";

interface ParsePreviewProps {
  parsed: ParsedTask;
  className?: string;
}

export function ParsePreview({ parsed, className }: ParsePreviewProps) {
  const displayPersons = parsed.personNames ?? (parsed.personName ? [parsed.personName] : []);
  const hasDetails =
    parsed.dueDate ||
    parsed.followUpDate ||
    parsed.priority ||
    displayPersons.length > 0 ||
    (parsed.tags && parsed.tags.length > 0);

  return (
    <div className={cn("rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2 animate-slide-up", className)}>
      {/* Parsed title */}
      <p className="text-sm font-medium text-foreground">{parsed.title}</p>

      {/* Extracted fields */}
      {hasDetails && (
        <div className="flex flex-wrap gap-2">
          {parsed.dueDate && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-full px-2 py-0.5">
              <Calendar className="h-3 w-3" aria-hidden />
              Due {formatDate(parsed.dueDate)}
            </span>
          )}
          {parsed.followUpDate && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-full px-2 py-0.5">
              <Bell className="h-3 w-3" aria-hidden />
              Follow-up {formatDate(parsed.followUpDate)}
            </span>
          )}
          {parsed.priority && parsed.priority !== "MEDIUM" && (
            <PriorityBadge priority={parsed.priority} />
          )}
          {displayPersons.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              <User className="h-3 w-3" aria-hidden />
              {displayPersons.join(", ")}
            </span>
          )}
          {parsed.tags?.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              <Tag className="h-3 w-3" aria-hidden />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Person limit warning */}
      {parsed.personLimitWarning && (
        <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden />
          FocusFlow assigns tasks to a maximum of 4 people — extra names ignored.
        </p>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-primary/10">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.round(parsed.confidence * 100)}%` }}
            aria-hidden
          />
        </div>
        {parsed.confidence < 0.5 && (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertCircle className="h-3 w-3" aria-hidden />
            Low confidence
          </span>
        )}
      </div>
    </div>
  );
}
