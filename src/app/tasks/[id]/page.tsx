export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Task Detail</h1>
      <p className="text-sm text-muted-foreground mt-1">Task ID: {id}</p>
    </main>
  );
}
