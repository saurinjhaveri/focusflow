import { NextResponse } from "next/server";
import { parser } from "@/lib/parser";

export async function POST(request: Request) {
  const { raw } = await request.json();
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "raw string required" }, { status: 400 });
  }

  const parsed = parser.parse(raw);
  return NextResponse.json({ parsed });
}
