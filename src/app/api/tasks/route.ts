import { NextResponse } from "next/server";
import { getTasks, createTask, createTaskFromText } from "@/lib/actions/tasks";
import type { TaskFilters } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: TaskFilters = {};
  const status = searchParams.get("status");
  const personId = searchParams.get("personId");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  if (status) filters.status = status as TaskFilters["status"];
  if (personId) filters.personId = personId;
  if (priority) filters.priority = priority as TaskFilters["priority"];
  if (search) filters.search = search;

  const tasks = await getTasks(filters);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Natural language quick capture
  if (body.raw) {
    const task = await createTaskFromText(body.raw);
    return NextResponse.json({ task }, { status: 201 });
  }

  const task = await createTask(body);
  return NextResponse.json({ task }, { status: 201 });
}
