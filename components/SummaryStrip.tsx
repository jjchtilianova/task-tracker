"use client";
import type { Task } from "@/lib/types";

export function SummaryStrip({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter(
    (t) => !t.completed && t.completionDate && new Date(t.completionDate) < now
  ).length;
  const inProgress = tasks.filter(
    (t) => !t.completed && (!t.completionDate || new Date(t.completionDate) >= now)
  ).length;

  const stats = [
    { label: "Total", value: total, color: "text-slate-700" },
    { label: "Completed", value: completed, color: "text-indigo-600" },
    { label: "Overdue", value: overdue, color: "text-red-600" },
    { label: "In Progress", value: inProgress, color: "text-amber-600" },
  ];

  return (
    <div className="flex gap-6 px-6 py-3 bg-white border-b border-slate-200">
      {stats.map((s) => (
        <div key={s.label} className="flex items-baseline gap-1.5">
          <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
          <span className="text-xs text-slate-500 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
