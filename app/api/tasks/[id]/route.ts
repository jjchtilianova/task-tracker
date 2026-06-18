import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(task: Record<string, unknown>) {
  return {
    ...task,
    assignees: JSON.parse((task.assignees as string) || "[]"),
    startDate: task.startDate ? new Date(task.startDate as string).toISOString() : null,
    completionDate: task.completionDate ? new Date(task.completionDate as string).toISOString() : null,
    createdAt: new Date(task.createdAt as string).toISOString(),
    updatedAt: new Date(task.updatedAt as string).toISOString(),
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(task as unknown as Record<string, unknown>));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description ?? null,
      assignees: JSON.stringify(body.assignees ?? []),
      workstream: body.workstream,
      priority: body.priority ?? "Medium",
      startDate: body.startDate ? new Date(body.startDate) : null,
      completionDate: body.completionDate ? new Date(body.completionDate) : null,
      completed: body.completed ?? false,
    },
  });
  return NextResponse.json(serialize(task as unknown as Record<string, unknown>));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
