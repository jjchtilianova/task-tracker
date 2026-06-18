"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import type { Task, TeamMember, Workstream } from "@/lib/types";
import { SummaryStrip } from "./SummaryStrip";
import { FilterBar, type Filters } from "./FilterBar";
import { KanbanBoard } from "./KanbanBoard";
import { ListView } from "./ListView";
import { TaskForm } from "./TaskForm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TaskTracker() {
  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>("/api/tasks", fetcher, { refreshInterval: 30000 });
  const { data: workstreams = [] } = useSWR<Workstream[]>("/api/workstreams", fetcher);
  const { data: members = [] } = useSWR<TeamMember[]>("/api/members", fetcher);

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showNewTask, setShowNewTask] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    assignee: "",
    workstream: "",
    status: "all",
    from: "",
    to: "",
  });

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.assignee && !t.assignees.includes(filters.assignee)) return false;
      if (filters.workstream && t.workstream !== filters.workstream) return false;
      if (filters.status === "active" && t.completed) return false;
      if (filters.status === "completed" && !t.completed) return false;
      if (filters.from) {
        const due = t.completionDate ? new Date(t.completionDate) : null;
        if (!due || due < new Date(filters.from)) return false;
      }
      if (filters.to) {
        const due = t.completionDate ? new Date(t.completionDate) : null;
        if (!due || due > new Date(filters.to)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  function handleUpdate(updated: Task) {
    mutateTasks((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)), false);
  }

  function handleDelete(id: string) {
    mutateTasks((prev) => prev?.filter((t) => t.id !== id), false);
  }

  async function handleCreate(data: Partial<Task>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const task = await res.json();
      mutateTasks((prev) => [task, ...(prev ?? [])], false);
      setShowNewTask(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Task Tracker</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New task
          </button>
        </div>
      </header>

      <SummaryStrip tasks={tasks} />
      <FilterBar filters={filters} onChange={setFilters} members={members} workstreams={workstreams} />

      {/* New task modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">New task</h2>
            <TaskForm
              members={members}
              workstreams={workstreams}
              onSubmit={handleCreate}
              onCancel={() => setShowNewTask(false)}
            />
          </div>
        </div>
      )}

      {/* Board / List */}
      <main className="flex-1 py-4">
        {view === "kanban" ? (
          <KanbanBoard
            tasks={filtered}
            workstreams={workstreams}
            members={members}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <ListView
            tasks={filtered}
            members={members}
            workstreams={workstreams}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
