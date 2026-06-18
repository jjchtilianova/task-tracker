import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.teamMember.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const { name, email, color } = await req.json();
  const member = await prisma.teamMember.create({ data: { name, email, color } });
  return NextResponse.json(member, { status: 201 });
}
