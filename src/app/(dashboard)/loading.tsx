import { PageWrapper } from "@/components/ui/page-wrapper";
import { TaskListSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        {/* Capture skeleton */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Task list skeleton */}
        <TaskListSkeleton count={5} />
      </div>
    </PageWrapper>
  );
}
