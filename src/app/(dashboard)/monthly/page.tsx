import { PageWrapper } from "@/components/ui/page-wrapper";
import { MonthlyCalendar } from "@/components/views/monthly-calendar";
import { getMonthlyTasks } from "@/lib/actions/tasks";

export default async function MonthlyPage() {
  const now = new Date();
  const tasks = await getMonthlyTasks(now.getFullYear(), now.getMonth());

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Monthly</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tap any day to see its tasks</p>
      </div>

      <MonthlyCalendar initialTasks={tasks as any} />
    </PageWrapper>
  );
}
