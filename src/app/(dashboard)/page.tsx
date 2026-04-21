export const dynamic = "force-dynamic";

import Link from "next/link";
import { AlertTriangle, CalendarDays, CalendarRange, ArrowRight } from "lucide-react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { QuickCapture } from "@/components/capture/quick-capture";
import { getDashboardStats } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function dateStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

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
      <div className="mb-2">
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
    </PageWrapper>
  );
}
