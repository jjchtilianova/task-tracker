"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TeamMember, Workstream } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  workstream: string;
  tasks: Task[];
  members: TeamMember[];
  workstreams: Workstream[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

function SortableTaskCard({
  task,
  members,
  workstreams,
  onUpdate,
  onDelete,
}: {
  task: Task;
  members: TeamMember[];
  workstreams: Workstream[];
  onUpdate: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        members={members}
        workstreams={workstreams}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement>}
      />
    </div>
  );
}

function KanbanColumn({ workstream, tasks, members, workstreams, onUpdate, onDelete }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: workstream });
  return (
    <div className="flex-1 min-w-[260px] max-w-[320px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{workstream}</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[120px] rounded-xl p-2 transition-colors ${
          isOver ? "bg-indigo-50 ring-2 ring-indigo-200" : "bg-slate-100"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              members={members}
              workstreams={workstreams}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">No tasks</p>
        )}
      </div>
    </div>
  );
}

interface BoardProps {
  tasks: Task[];
  workstreams: Workstream[];
  members: TeamMember[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ tasks, workstreams, members, onUpdate, onDelete }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const newWorkstream = over.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.workstream === newWorkstream) return;

    const updated = { ...task, workstream: newWorkstream };
    onUpdate(updated);

    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-6">
        {workstreams.map((ws) => (
          <KanbanColumn
            key={ws.id}
            workstream={ws.name}
            tasks={tasks.filter((t) => t.workstream === ws.name)}
            members={members}
            workstreams={workstreams}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-2 shadow-xl">
            <TaskCard
              task={activeTask}
              members={members}
              workstreams={workstreams}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
