"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { ChevronDown, ChevronUp, Clock, Bell, MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { TaskStatusToggle } from "./task-status-toggle";
import { PriorityDot } from "@/components/ui/priority-badge";
import { PersonBadge } from "@/components/persons/person-badge";
import { Button } from "@/components/ui/button";
import { deleteTask, updateTask } from "@/lib/actions/tasks";
import { formatDate, isOverdue, isToday, isTomorrow } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  variant?: "default" | "overdue" | "compact";
}

type PersonOption = { id: string; name: string; color: string };

export function TaskCard({ task, variant = "default" }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [isPending, startTransition] = useTransition();
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const isDone = task.status === "DONE";
  const overdueDate = task.dueDate && isOverdue(task.dueDate) && !isDone;
  const pendingFollowUps = task.followUps.filter((f) => !f.done);

  useEffect(() => {
    if (!showAssign) return;
    fetch("/api/persons")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.persons)) setPersons(data.persons); })
      .catch(() => {});
  }, [showAssign]);

  function handleDelete() {
    setShowMenu(false);
    startTransition(() => deleteTask(task.id));
  }

  function handleAssign(personId: string | null) {
    setShowMenu(false);
    setShowAssign(false);
    startTransition(async () => { await updateTask(task.id, { personId }); });
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
      {variant === "overdue" && (
        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-accent" aria-hidden />
      )}

      <div className="flex items-start gap-3 p-3.5">
        <div className="pt-0.5">
          <TaskStatusToggle taskId={task.id} status={task.status} />
        </div>

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

            <div className="flex items-center gap-1 flex-shrink-0">
              <PriorityDot priority={task.priority} />

              <div className="relative">
                <Button
                  ref={menuBtnRef}
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={() => {
                    if (!showMenu && menuBtnRef.current) {
                      const r = menuBtnRef.current.getBoundingClientRect();
                      setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                    }
                    setShowMenu((v) => !v);
                    setShowAssign(false);
                  }}
                  aria-label="Task options"
                  aria-expanded={showMenu}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                </Button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowAssign(false); }} aria-hidden />
                    <div className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-card shadow-lg py-1 animate-fade-in" style={{ top: menuPos.top, right: menuPos.right }}>
                      {!showAssign ? (
                        <>
                          <button
                            onClick={() => setShowAssign(true)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <UserPlus className="h-3.5 w-3.5" aria-hidden />
                            Assign to…
                          </button>
                          <button
                            onClick={handleDelete}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Delete task
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Assign to</p>
                          {task.person && (
                            <button
                              onClick={() => handleAssign(null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                              Unassign
                            </button>
                          )}
                          {persons.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleAssign(p.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: p.color }}
                              />
                              {p.name}
                            </button>
                          ))}
                          {persons.length === 0 && (
                            <p className="px-3 py-2 text-xs text-muted-foreground">No people added yet</p>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

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
