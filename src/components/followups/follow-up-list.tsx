import { FollowUpCard } from "./follow-up-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getPendingFollowUps } from "@/lib/actions/followups";
import { Bell, AlertTriangle, Clock } from "lucide-react";
import { isOverdue, isToday } from "@/lib/utils";

export async function FollowUpList() {
  const followUps = await getPendingFollowUps();

  if (followUps.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No pending follow-ups"
        description="When you create tasks with follow-up dates, they'll appear here."
      />
    );
  }

  const overdue = followUps.filter((f) => isOverdue(f.scheduledAt));
  const dueToday = followUps.filter(
    (f) => isToday(f.scheduledAt) && !isOverdue(f.scheduledAt)
  );
  const upcoming = followUps.filter(
    (f) => !isOverdue(f.scheduledAt) && !isToday(f.scheduledAt)
  );

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <section aria-labelledby="fu-overdue">
          <SectionHeader
            id="fu-overdue"
            title="Overdue"
            count={overdue.length}
            variant="overdue"
            icon={AlertTriangle}
            className="mb-3"
          />
          <div className="space-y-2">
            {overdue.map((fu) => (
              <div key={fu.id} className="animate-fade-in">
                <FollowUpCard followUp={fu as any} />
              </div>
            ))}
          </div>
        </section>
      )}

      {dueToday.length > 0 && (
        <section aria-labelledby="fu-today">
          <SectionHeader
            id="fu-today"
            title="Due today"
            count={dueToday.length}
            variant="followup"
            icon={Bell}
            className="mb-3"
          />
          <div className="space-y-2">
            {dueToday.map((fu) => (
              <div key={fu.id} className="animate-fade-in">
                <FollowUpCard followUp={fu as any} />
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="fu-upcoming">
          <SectionHeader
            id="fu-upcoming"
            title="Upcoming"
            count={upcoming.length}
            icon={Clock}
            className="mb-3"
          />
          <div className="space-y-2">
            {upcoming.map((fu) => (
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
