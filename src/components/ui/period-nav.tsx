"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PeriodNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export function PeriodNav({
  label, onPrev, onNext, onReset, showReset = false, className,
}: PeriodNavProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrev}
        aria-label="Previous period"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </Button>

      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {showReset && onReset && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onReset}
            aria-label="Go to current period"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        aria-label="Next period"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
