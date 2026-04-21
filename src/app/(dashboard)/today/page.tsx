export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { TodayBoard } from "@/components/views/today-board";
import { TaskListSkeleton } from "@/components/ui/skeleton";

export default function TodayPage() {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      <Suspense fallback={<TaskListSkeleton count={4} />}>
        <TodayBoard />
      </Suspense>
    </PageWrapper>
  );
}
