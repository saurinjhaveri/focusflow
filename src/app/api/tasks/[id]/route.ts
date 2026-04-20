import { NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask, completeTask } from "@/lib/actions/tasks";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "complete") {
    const task = await completeTask(id);
    return NextResponse.json({ task });
  }

  const task = await updateTask(id, body);
  return NextResponse.json({ task });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteTask(id);
  return NextResponse.json({ ok: true });
}
