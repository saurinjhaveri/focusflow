import { CheckCircle2, AlertTriangle, Bell, CalendarDays } from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { FollowUpCard } from "@/components/followups/follow-up-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getTodayTasks } from "@/lib/actions/tasks";
import { getTodayFollowUps, getOverdueFollowUps } from "@/lib/actions/followups";

export async function TodayBoard() {
  const [{ overdue, today }, todayFollowUps, overdueFollowUps] =
    await Promise.all([
      getTodayTasks(),
      getTodayFollowUps(),
      getOverdueFollowUps(),
    ]);

  const allFollowUps = [
    ...overdueFollowUps,
    ...todayFollowUps.filter(
      (f) => !overdueFollowUps.find((o) => o.id === f.id)
    ),
  ];

  const totalActive = overdue.length + today.length;

  return (
    <div className="space-y-6">
      {/* ── Overdue zone ─────────────────────────────────────── */}
      {overdue.length > 0 && (
        <section aria-labelledby="overdue-heading">
          <SectionHeader
            id="overdue-heading"
            title="Overdue"
            count={overdue.length}
            variant="overdue"
            className="mb-3"
            icon={AlertTriangle}
          />
          <div className="space-y-2">
            {overdue.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard task={task as any} variant="overdue" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Today zone ───────────────────────────────────────── */}
      <section aria-labelledby="today-heading">
        <SectionHeader
          id="today-heading"
          title="Today"
          count={today.length}
          className="mb-3"
          icon={CheckCircle2}
        />

        {today.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={totalActive === 0 ? "All clear for today" : "Nothing due today"}
            description={
              totalActive === 0
                ? "Add a task above to get started."
                : "Your overdue tasks need attention first."
            }
          />
        ) : (
          <div className="space-y-2">
            {today.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard task={task as any} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Follow-ups zone ──────────────────────────────────── */}
      {allFollowUps.length > 0 && (
        <section aria-labelledby="followups-heading">
          <SectionHeader
            id="followups-heading"
            title="Follow-ups due"
            count={allFollowUps.length}
            variant="followup"
            className="mb-3"
            icon={Bell}
          />
          <div className="space-y-2">
            {allFollowUps.map((fu) => (
              <div key={fu.id} className="animate-fade-in">
                <FollowUpCard followUp={fu as any} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
