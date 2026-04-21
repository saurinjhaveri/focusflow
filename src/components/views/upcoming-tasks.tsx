import { Clock } from "lucide-react";
import { getUpcomingTasks } from "@/lib/actions/tasks";
import { PriorityDot } from "@/components/ui/priority-badge";
import { PersonBadge } from "@/components/persons/person-badge";
import { formatDate, isToday, isTomorrow, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

function dueDateLabel(dueDate: Date | null) {
  if (!dueDate) return null;
  if (isOverdue(dueDate)) return { text: `Overdue · ${formatDate(dueDate)}`, cls: "text-destructive" };
  if (isToday(dueDate)) return { text: "Today", cls: "text-primary" };
  if (isTomorrow(dueDate)) return { text: "Tomorrow", cls: "text-warning" };
  return { text: formatDate(dueDate), cls: "text-muted-foreground" };
}

export async function UpcomingTasks() {
  const tasks = await getUpcomingTasks(5);

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No upcoming tasks — enjoy the clear horizon!
      </p>
    );
  }

  return (
    <ul className="space-y-0 divide-y divide-border">
      {tasks.map((task) => {
        const label = dueDateLabel(task.dueDate);
        return (
          <li key={task.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <PriorityDot priority={task.priority} />

            <p className={cn("flex-1 min-w-0 text-sm text-foreground truncate", task.status === "DONE" && "line-through text-muted-foreground")}>
              {task.title}
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              {task.person && <PersonBadge person={task.person} />}
              {label && (
                <span className={cn("flex items-center gap-1 text-xs font-medium whitespace-nowrap", label.cls)}>
                  <Clock className="h-3 w-3" aria-hidden />
                  {label.text}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
