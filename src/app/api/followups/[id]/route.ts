import { NextResponse } from "next/server";
import { completeFollowUp, snoozeFollowUp, deleteFollowUp } from "@/lib/actions/followups";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "complete") {
    const followUp = await completeFollowUp(id);
    return NextResponse.json({ followUp });
  }
  if (body.action === "snooze" && body.newDate) {
    const followUp = await snoozeFollowUp(id, new Date(body.newDate));
    return NextResponse.json({ followUp });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteFollowUp(id);
  return NextResponse.json({ ok: true });
}
