import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { QuickCapture } from "@/components/capture/quick-capture";
import { TodayBoard } from "@/components/views/today-board";
import { TaskListSkeleton } from "@/components/ui/skeleton";

function TodayGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-foreground tracking-tight">{greeting}</h1>
      <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
    </div>
  );
}

export default function TodayPage() {
  return (
    <PageWrapper>
      <TodayGreeting />

      {/* Quick capture — always visible */}
      <div className="mb-6">
        <QuickCapture autoFocus={false} />
      </div>

      {/* Today board — server-rendered with Suspense */}
      <Suspense fallback={<TaskListSkeleton count={4} />}>
        <TodayBoard />
      </Suspense>
    </PageWrapper>
  );
}
