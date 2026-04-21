"use client";

import { useRef, useTransition, useCallback, useEffect, useState } from "react";
import { Plus, ArrowRight, X } from "lucide-react";
import { ParsePreview } from "./parse-preview";
import { Button } from "@/components/ui/button";
import { createTaskFromText } from "@/lib/actions/tasks";
import { useCaptureStore } from "@/store/capture-store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { ParsedTask } from "@/lib/parser/types";

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface QuickCaptureProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export function QuickCapture({
  placeholder = 'e.g. "Call Rajan about proposal by Friday, follow up Tuesday"',
  autoFocus = false,
  onSuccess,
  className,
}: QuickCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [parsedPreview, setParsedPreview] = useState<ParsedTask | null>(null);
  const { toast } = useToast();

  const { rawInput, setRawInput, reset } = useCaptureStore();
  const debouncedInput = useDebounced(rawInput, 350);

  // Live parse preview
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setParsedPreview(null);
      return;
    }
    let cancelled = false;
    fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: debouncedInput }),
    })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setParsedPreview(data.parsed); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [debouncedInput]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = rawInput.trim();
      if (!text || isPending) return;
      startTransition(async () => {
        await createTaskFromText(text);
        reset();
        setParsedPreview(null);
        toast("Task added", "success");
        onSuccess?.();
        inputRef.current?.focus();
      });
    },
    [rawInput, isPending, reset, onSuccess, toast]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e as unknown as React.FormEvent);
    if (e.key === "Escape") {
      reset();
      setParsedPreview(null);
      inputRef.current?.blur();
    }
  };

  const hasInput = rawInput.trim().length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <form onSubmit={handleSubmit} noValidate>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-card px-3 py-2",
            "transition-all duration-150",
            hasInput
              ? "border-primary/40 shadow-sm shadow-primary/10"
              : "border-border hover:border-primary/30"
          )}
        >
          <Plus
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors duration-150",
              hasInput ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden
          />

          <input
            ref={inputRef}
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCapitalize="sentences"
            className={cn(
              "flex-1 bg-transparent text-sm text-foreground outline-none min-w-0 py-1.5",
              "placeholder:text-muted-foreground/60"
            )}
            aria-label="Quick task capture — describe your task in plain English"
          />

          {hasInput && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Touch targets: h-9 w-9 (36px) */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { reset(); setParsedPreview(null); }}
                aria-label="Clear input"
                className="h-9 w-9 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <Button
                type="submit"
                size="icon"
                loading={isPending}
                aria-label="Add task"
                className="h-9 w-9"
              >
                {!isPending && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
          )}
        </div>
      </form>

      {parsedPreview && hasInput && !isPending && (
        <ParsePreview parsed={parsedPreview} />
      )}
    </div>
  );
}
