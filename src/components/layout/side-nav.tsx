"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  CalendarDays,
  CalendarRange,
  Users,
  Bell,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { href: "/",          label: "Today",      icon: CheckSquare,  description: "What needs doing now" },
  { href: "/weekly",    label: "This Week",  icon: CalendarDays, description: "7-day overview"       },
  { href: "/monthly",   label: "Monthly",    icon: CalendarRange,description: "Month at a glance"    },
] as const;

const SECONDARY_NAV = [
  { href: "/team",      label: "Team",       icon: Users },
  { href: "/followups", label: "Follow-ups", icon: Bell  },
] as const;

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="flex h-full w-56 flex-col border-r border-border bg-card px-3 py-4 gap-1"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-white" aria-hidden />
        </div>
        <span className="text-base font-bold text-foreground tracking-tight">FocusFlow</span>
      </div>

      {/* Primary nav */}
      <ul className="space-y-0.5" role="list">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="my-2 border-t border-border" role="separator" />

      {/* Secondary nav */}
      <ul className="space-y-0.5" role="list">
        {SECONDARY_NAV.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Settings — bottom */}
      <div className="mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isActive("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-current={isActive("/settings") ? "page" : undefined}
        >
          <Settings className="h-4 w-4 flex-shrink-0" aria-hidden />
          Settings
        </Link>
      </div>
    </nav>
  );
}
