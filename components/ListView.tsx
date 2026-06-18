"use client";
import { useState } from "react";
import { format } from "date-fns";
import type { Task, TeamMember, Workstream } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";
import { CompletionToggle } from "./CompletionToggle";
import { TaskForm } from "./TaskForm";

type SortKey = "title" | "workstream" | "priority" | "completionDate" | "createdAt";

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

interface Props {
  tasks: Task[];
  members: TeamMember[];
  workstreams: Workstream[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function ListView({ tasks, members, workstreams, onUpdate, onDelete }: Props) {
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setDir("asc"); }
  }

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sort === "priority") {
      cmp = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    } else if (sort === "completionDate") {
      cmp = (a.completionDate ?? "").localeCompare(b.completionDate ?? "");
    } else if (sort === "createdAt") {
      cmp = a.createdAt.localeCompare(b.createdAt);
    } else {
      cmp = (a[sort] ?? "").localeCompare(b[sort] ?? "");
    }
    return dir === "asc" ? cmp : -cmp;
  });

  async function handleToggleComplete(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}/complete`, { method: "PATCH" });
    if (res.ok) onUpdate(await res.json());
  }

  async function handleSave(id: string, task: Task, data: Partial<Task>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, ...data }),
    });
    if (res.ok) {
      onUpdate(await res.json());
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-800"
    >
      {label}
      {sort === k && <span>{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );

  const now = new Date();

  return (
    <div className="px-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-3 pr-4 w-6" />
            <th className="py-3 pr-4 text-left"><SortBtn k="title" label="Title" /></th>
            <th className="py-3 pr-4 text-left"><SortBtn k="workstream" label="Workstream" /></th>
            <th className="py-3 pr-4 text-left"><SortBtn k="priority" label="Priority" /></th>
            <th className="py-3 pr-4 text-left">Assignees</th>
            <th className="py-3 pr-4 text-left"><SortBtn k="completionDate" label="Due" /></th>
            <th className="py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const assignedMembers = members.filter((m) => task.assignees.includes(m.name));
            const isOverdue = !task.completed && task.completionDate && new Date(task.completionDate) < now;

            if (editingId === task.id) {
              return (
                <tr key={task.id}>
                  <td colSpan={7} className="py-3">
                    <div className="border border-indigo-200 rounded-xl p-4">
                      <TaskForm
                        initial={task}
                        members={members}
                        workstreams={workstreams}
                        onSubmit={(data) => handleSave(task.id, task, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={task.id}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${task.completed ? "opacity-60" : ""}`}
              >
                <td className="py-3 pr-4">
                  <CompletionToggle completed={task.completed} onChange={() => handleToggleComplete(task)} />
                </td>
                <td className="py-3 pr-4 max-w-[280px]">
                  <span className={task.completed ? "line-through text-slate-400" : "text-slate-800 font-medium"}>
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                  )}
                </td>
                <td className="py-3 pr-4 text-slate-600">{task.workstream}</td>
                <td className="py-3 pr-4"><PriorityBadge priority={task.priority} /></td>
                <td className="py-3 pr-4">
                  <div className="flex -space-x-1">
                    {assignedMembers.map((m) => <Avatar key={m.id} member={m} />)}
                  </div>
                </td>
                <td className={`py-3 pr-4 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                  {task.completionDate ? format(new Date(task.completionDate), "MMM d, yyyy") : "—"}
                  {isOverdue && " ⚠"}
                </td>
                <td className="py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingId(task.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-xs text-slate-400 hover:text-red-500 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-sm text-slate-400 py-8 text-center">No tasks match the current filters.</p>
      )}
    </div>
  );
}
