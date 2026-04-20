import { PersonGroup } from "./person-group";
import { UnassignedGroup } from "./unassigned-group";
import { EmptyState } from "@/components/ui/empty-state";
import { getTasksByPerson, getTasks } from "@/lib/actions/tasks";
import { Users } from "lucide-react";

export async function TeamBoard() {
  const [personGroups, allTasks] = await Promise.all([
    getTasksByPerson(),
    getTasks({ status: undefined }), // all non-cancelled
  ]);

  // Tasks with no person assigned
  const unassigned = (allTasks as any[]).filter((t: any) => !t.personId && t.status !== "CANCELLED");

  const hasAnyContent =
    personGroups.some((p) => p.tasks.length > 0) || unassigned.length > 0;

  if (!hasAnyContent) {
    return (
      <EmptyState
        icon={Users}
        title="No team tasks yet"
        description="Assign tasks to people to see them grouped here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {personGroups
        .filter((p) => p.tasks.length > 0)
        .map((p) => (
          <PersonGroup
            key={p.id}
            personId={p.id}
            personName={p.name}
            color={p.color}
            tasks={p.tasks as any}
            defaultOpen
          />
        ))}

      <UnassignedGroup tasks={unassigned as any} />
    </div>
  );
}
