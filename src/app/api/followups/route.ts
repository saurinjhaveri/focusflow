import { NextResponse } from "next/server";
import { getPendingFollowUps, createFollowUp } from "@/lib/actions/followups";

export async function GET() {
  const followUps = await getPendingFollowUps();
  return NextResponse.json({ followUps });
}

export async function POST(request: Request) {
  const body = await request.json();
  const followUp = await createFollowUp({
    taskId: body.taskId,
    scheduledAt: new Date(body.scheduledAt),
    note: body.note,
  });
  return NextResponse.json({ followUp }, { status: 201 });
}
