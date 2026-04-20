"use client";

import { useState } from "react";
import { getStartOfWeek, getEndOfWeek } from "@/lib/utils";

export function useWeekNav() {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseMonday = getStartOfWeek();
  const weekStart = new Date(baseMonday);
  weekStart.setDate(baseMonday.getDate() + weekOffset * 7);

  const weekEnd = getEndOfWeek(weekStart);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isCurrentWeek = weekOffset === 0;
  const label =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.toLocaleDateString("en-US", { month: "long" })} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      : `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return {
    weekOffset,
    weekStart,
    weekEnd,
    days,
    label,
    isCurrentWeek,
    prev: () => setWeekOffset((o) => o - 1),
    next: () => setWeekOffset((o) => o + 1),
    reset: () => setWeekOffset(0),
  };
}
