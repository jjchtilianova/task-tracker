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

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
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
  return NextResponse.json(serialize(task as unknown as Record<string, unknown>), { status: 201 });
}
