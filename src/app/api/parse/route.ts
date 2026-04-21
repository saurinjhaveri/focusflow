import { NextResponse } from "next/server";
import { parser } from "@/lib/parser";
import { detectPersonsInText } from "@/lib/actions/tasks";

export async function POST(request: Request) {
  const { raw } = await request.json();
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "raw string required" }, { status: 400 });
  }

  const [parsed, { persons, limitExceeded }] = await Promise.all([
    Promise.resolve(parser.parse(raw)),
    detectPersonsInText(raw),
  ]);

  const names = persons.map(p => p.name);

  return NextResponse.json({
    parsed: {
      ...parsed,
      personName: names[0],
      personNames: names.length > 0 ? names : undefined,
      personLimitWarning: limitExceeded || undefined,
    },
  });
}
