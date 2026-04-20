export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { FollowUpList } from "@/components/followups/follow-up-list";
import { TaskListSkeleton } from "@/components/ui/skeleton";

export default function FollowUpsPage() {
  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Follow-ups
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Everything you need to check in on
        </p>
      </div>

      <Suspense fallback={<TaskListSkeleton count={5} />}>
        <FollowUpList />
      </Suspense>
    </PageWrapper>
  );
}
