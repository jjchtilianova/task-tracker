import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const workstreams = await prisma.workstream.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(workstreams);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const ws = await prisma.workstream.create({ data: { name } });
  return NextResponse.json(ws, { status: 201 });
}
