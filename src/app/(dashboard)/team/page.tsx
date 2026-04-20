export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { TeamBoard } from "@/components/views/team-board";
import { TaskListSkeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tasks grouped by person
        </p>
      </div>

      <Suspense fallback={<TaskListSkeleton count={6} />}>
        <TeamBoard />
      </Suspense>
    </PageWrapper>
  );
}
