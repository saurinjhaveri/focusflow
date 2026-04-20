/**
 * Resolves relative date expressions to absolute Date objects.
 * All resolutions are relative to `now` (default: new Date()).
 */

export function resolveRelativeDate(
  expr: string,
  now: Date = new Date()
): Date | undefined {
  const base = new Date(now);
  base.setHours(23, 59, 0, 0);

  const s = expr.toLowerCase().trim();

  if (s === "today") {
    base.setHours(18, 0, 0, 0);
    return base;
  }
  if (s === "tomorrow") {
    base.setDate(base.getDate() + 1);
    return base;
  }
  if (s === "yesterday") {
    base.setDate(base.getDate() - 1);
    return base;
  }
  if (s === "eod" || s === "end of day") {
    base.setHours(18, 0, 0, 0);
    return base;
  }
  if (s === "next week") {
    base.setDate(base.getDate() + 7);
    return base;
  }
  if (s === "next month") {
    base.setMonth(base.getMonth() + 1);
    return base;
  }

  // "in N days/weeks/months"
  const inMatch = s.match(/^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    const unit = inMatch[2];
    if (unit.startsWith("day")) base.setDate(base.getDate() + n);
    else if (unit.startsWith("week")) base.setDate(base.getDate() + n * 7);
    else if (unit.startsWith("month")) base.setMonth(base.getMonth() + n);
    return base;
  }

  // Weekday names (next occurrence)
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayIdx = weekdays.indexOf(s);
  if (dayIdx !== -1) {
    const today = now.getDay();
    let diff = dayIdx - today;
    if (diff <= 0) diff += 7;
    base.setDate(base.getDate() + diff);
    return base;
  }

  // "this friday" / "next friday"
  const thisNextMatch = s.match(/^(this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (thisNextMatch) {
    const modifier = thisNextMatch[1];
    const targetDay = weekdays.indexOf(thisNextMatch[2]);
    const today = now.getDay();
    let diff = targetDay - today;
    if (diff <= 0) diff += 7;
    if (modifier === "next") diff += 7;
    base.setDate(base.getDate() + diff);
    return base;
  }

  // Absolute: "Jan 15", "15 Jan", "15/01", "01/15"
  const monthNames = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];

  const monthWordMatch = s.match(
    /^(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/
  ) || s.match(
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/
  );
  if (monthWordMatch) {
    const numPart = parseInt(monthWordMatch[1]) || parseInt(monthWordMatch[2]);
    const monPart = monthWordMatch[1].match(/[a-z]/)
      ? monthWordMatch[1].slice(0, 3)
      : monthWordMatch[2]?.slice(0, 3);
    const monthIdx = monthNames.indexOf(monPart ?? "");
    if (monthIdx !== -1 && numPart >= 1 && numPart <= 31) {
      const year = base.getFullYear();
      const d = new Date(year, monthIdx, numPart, 18, 0, 0, 0);
      // If date already passed this year, use next year
      if (d < now) d.setFullYear(year + 1);
      return d;
    }
  }

  return undefined;
}
