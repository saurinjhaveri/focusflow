"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
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
  { href: "/",        label: "Dashboard", icon: LayoutDashboard, exact: true  },
  { href: "/today",   label: "Today",     icon: CheckSquare,     exact: true  },
  { href: "/weekly",  label: "This Week", icon: CalendarDays,    exact: false },
  { href: "/monthly", label: "Monthly",   icon: CalendarRange,   exact: false },
] as const;

const SECONDARY_NAV = [
  { href: "/team",      label: "Team",       icon: Users },
  { href: "/followups", label: "Follow-ups", icon: Bell  },
] as const;

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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
        {PRIMARY_NAV.map(({ href, label, icon: Icon, exact }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive(href, exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive(href, exact) ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="my-2 border-t border-border" role="separator" />

      <ul className="space-y-0.5" role="list">
        {SECONDARY_NAV.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                pathname.startsWith(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          <Settings className="h-4 w-4 flex-shrink-0" aria-hidden />
          Settings
        </Link>
      </div>
    </nav>
  );
}
