export const dynamic = "force-dynamic";

import { PageWrapper } from "@/components/ui/page-wrapper";
import { WeeklyGrid } from "@/components/views/weekly-grid";
import { getWeeklyTasks } from "@/lib/actions/tasks";
import { getStartOfWeek, getEndOfWeek } from "@/lib/utils";

export default async function WeeklyPage() {
  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();

  const windowStart = new Date(weekStart);
  windowStart.setDate(weekStart.getDate() - 7);
  const windowEnd = new Date(weekEnd);
  windowEnd.setDate(weekEnd.getDate() + 7);

  const tasks = await getWeeklyTasks(windowStart, windowEnd);

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">This Week</h1>
        <p className="text-sm text-muted-foreground mt-0.5">7-day schedule</p>
      </div>
      <WeeklyGrid initialTasks={tasks as any} />
    </PageWrapper>
  );
}
