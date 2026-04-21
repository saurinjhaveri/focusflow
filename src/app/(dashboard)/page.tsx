export const dynamic = "force-dynamic";

import Link from "next/link";
import { AlertTriangle, CalendarDays, CalendarRange, ArrowRight, Clock } from "lucide-react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { QuickCapture } from "@/components/capture/quick-capture";
import { PriorityDot } from "@/components/ui/priority-badge";
import { PersonBadge } from "@/components/persons/person-badge";
import { getDashboardStats, getUpcomingTasks } from "@/lib/actions/tasks";
import { formatDate, isToday, isTomorrow, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function dateStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function upcomingDateLabel(dueDate: Date | null) {
  if (!dueDate) return null;
  if (isOverdue(dueDate)) return { text: `Overdue · ${formatDate(dueDate)}`, cls: "text-destructive" };
  if (isToday(dueDate)) return { text: "Today", cls: "text-primary" };
  if (isTomorrow(dueDate)) return { text: "Tomorrow", cls: "text-warning" };
  return { text: formatDate(dueDate), cls: "text-muted-foreground" };
}

export default async function DashboardPage() {
  const [stats, upcoming] = await Promise.all([getDashboardStats(), getUpcomingTasks(5)]);

  const cards = [
    {
      label: "Overdue",
      count: stats.overdue,
      href: "/today",
      icon: AlertTriangle,
      bg: stats.overdue > 0 ? "bg-destructive/8 border-destructive/20" : "bg-card border-border",
      iconColor: stats.overdue > 0 ? "text-destructive" : "text-muted-foreground",
      countColor: stats.overdue > 0 ? "text-destructive" : "text-foreground",
    },
    {
      label: "This Week",
      count: stats.dueThisWeek,
      href: "/weekly",
      icon: CalendarDays,
      bg: "bg-card border-border",
      iconColor: "text-primary",
      countColor: "text-foreground",
    },
    {
      label: "This Month",
      count: stats.dueThisMonth,
      href: "/monthly",
      icon: CalendarRange,
      bg: "bg-card border-border",
      iconColor: "text-secondary",
      countColor: "text-foreground",
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{greeting()}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr()}</p>
      </div>

      {/* Quick capture */}
      <div className="mb-8">
        <QuickCapture autoFocus={false} />
      </div>

      {/* Stat cards */}
      <div className="mb-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {cards.map(({ label, count, href, icon: Icon, bg, iconColor, countColor }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "group flex flex-col gap-2 rounded-xl border p-3 sm:p-4 transition-all duration-150",
                "hover:shadow-md active:scale-[0.98]",
                bg
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn("h-4 w-4", iconColor)} aria-hidden />
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" aria-hidden />
              </div>
              <div>
                <p className={cn("text-2xl font-bold tabular-nums leading-none", countColor)}>{count}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming tasks */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Up Next</h2>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No upcoming tasks with dates set.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((task) => {
                const label = upcomingDateLabel(task.dueDate);
                return (
                  <li key={task.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <PriorityDot priority={task.priority} />
                    <p className="flex-1 min-w-0 text-sm text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {[
                        ...(task.person ? [task.person] : []),
                        ...(task.taskPersons ?? []).map(tp => tp.person).filter(p => p.id !== task.person?.id),
                      ].map(p => <PersonBadge key={p.id} person={p} />)}
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
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
