"use client";

import { Check } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { THEMES, type ThemeKey } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ColorSchemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-0.5">Color Scheme</h2>
      <p className="text-xs text-muted-foreground mb-4">Changes apply instantly across the app</p>
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]).map(
          ([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              aria-pressed={theme === key}
              aria-label={`${t.label} theme — ${t.description}`}
              className={cn(
                "relative flex flex-col gap-3 rounded-xl border p-4 text-left",
                "transition-all duration-150 active:scale-[0.97]",
                theme === key
                  ? "border-primary ring-2 ring-primary/25 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              )}
            >
              {/* Swatches */}
              <div className="flex gap-1.5">
                {t.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{t.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.description}</p>
              </div>

              {theme === key && (
                <span
                  className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary"
                  aria-hidden
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        )}
      </div>
    </section>
  );
}
