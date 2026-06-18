import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });
  return NextResponse.json({
    ...updated,
    assignees: JSON.parse(updated.assignees || "[]"),
  });
}
