import { NextResponse } from "next/server";
import { getPersons, createPerson } from "@/lib/actions/persons";

export async function GET() {
  const persons = await getPersons();
  return NextResponse.json({ persons });
}

export async function POST(request: Request) {
  const body = await request.json();
  const person = await createPerson(body);
  return NextResponse.json({ person }, { status: 201 });
}
