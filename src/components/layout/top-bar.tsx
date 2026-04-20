"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/":          "Today",
  "/weekly":    "This Week",
  "/monthly":   "Monthly",
  "/team":      "Team",
  "/followups": "Follow-ups",
  "/settings":  "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "FocusFlow";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo — mobile only */}
        <Link href="/" className="flex items-center gap-2 md:hidden" aria-label="FocusFlow home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-3.5 w-3.5 text-white" aria-hidden />
          </div>
          <span className="text-sm font-bold text-foreground">{title}</span>
        </Link>

        {/* Title — desktop (sidebar handles logo) */}
        <h1 className={cn("text-base font-semibold text-foreground hidden md:block")}>{title}</h1>

        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          aria-label="Settings"
          className="md:hidden"
        >
          <Link href="/settings">
            <Settings className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </header>
  );
}
