import { PageWrapper } from "@/components/ui/page-wrapper";
import { WeeklyGrid } from "@/components/views/weekly-grid";
import { QuickCapture } from "@/components/capture/quick-capture";
import { getWeeklyTasks } from "@/lib/actions/tasks";
import { getStartOfWeek, getEndOfWeek } from "@/lib/utils";

export default async function WeeklyPage() {
  // Fetch current week on server; client handles navigation via hook
  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();

  // Fetch a wider window so the client-side nav has data available
  // (3-week window: last week + this week + next week)
  const windowStart = new Date(weekStart);
  windowStart.setDate(weekStart.getDate() - 7);
  const windowEnd = new Date(weekEnd);
  windowEnd.setDate(weekEnd.getDate() + 7);

  const tasks = await getWeeklyTasks(windowStart);

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">This Week</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Plan and track your 7-day schedule</p>
      </div>

      <div className="mb-5">
        <QuickCapture placeholder='e.g. "Finish report by Thursday"' />
      </div>

      <WeeklyGrid initialTasks={tasks as any} />
    </PageWrapper>
  );
}
