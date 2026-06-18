"use client";
import { useState } from "react";
import { format } from "date-fns";
import type { Task, TeamMember, Workstream } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";
import { CompletionToggle } from "./CompletionToggle";
import { TaskForm } from "./TaskForm";

interface Props {
  task: Task;
  members: TeamMember[];
  workstreams: Workstream[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function TaskCard({ task, members, workstreams, onUpdate, onDelete, dragHandleProps }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const assignedMembers = members.filter((m) => task.assignees.includes(m.name));
  const now = new Date();
  const isOverdue = !task.completed && task.completionDate && new Date(task.completionDate) < now;

  async function handleToggleComplete(completed: boolean) {
    const res = await fetch(`/api/tasks/${task.id}/complete`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    }
  }

  async function handleSave(data: Partial<Task>) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, ...data }),
    });
    if (res.ok) {
      onUpdate(await res.json());
      setEditing(false);
    }
  }

  async function handleDelete() {
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
        <TaskForm
          initial={task}
          members={members}
          workstreams={workstreams}
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`group bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md ${
        task.completed ? "border-slate-200 opacity-70" : isOverdue ? "border-red-200" : "border-slate-200"
      }`}
    >
      <div {...dragHandleProps} className="p-3 cursor-grab active:cursor-grabbing">
        <div className="flex items-start gap-2">
          <CompletionToggle completed={task.completed} onChange={handleToggleComplete} />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug ${
                task.completed ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          <PriorityBadge priority={task.priority} />
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">
              Overdue
            </span>
          )}
        </div>

        {(task.startDate || task.completionDate) && (
          <div className="mt-2 flex gap-3 text-xs text-slate-500">
            {task.startDate && (
              <span>Start: {format(new Date(task.startDate), "MMM d")}</span>
            )}
            {task.completionDate && (
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                Due: {format(new Date(task.completionDate), "MMM d")}
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex -space-x-1">
            {assignedMembers.map((m) => (
              <Avatar key={m.id} member={m} />
            ))}
          </div>
          <span className="task-id text-xs text-slate-400">{task.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-1.5 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Edit
        </button>
        {confirmDelete ? (
          <>
            <button onClick={handleDelete} className="text-xs text-red-600 hover:text-red-800 font-medium">
              Confirm delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-slate-400 hover:text-red-500 font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
