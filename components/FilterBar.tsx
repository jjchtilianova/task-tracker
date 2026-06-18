"use client";
import type { TeamMember, Workstream } from "@/lib/types";

export interface Filters {
  assignee: string;
  workstream: string;
  status: "all" | "active" | "completed";
  from: string;
  to: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  members: TeamMember[];
  workstreams: Workstream[];
}

export function FilterBar({ filters, onChange, members, workstreams }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-2 px-6 py-3 bg-white border-b border-slate-200">
      <select
        className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={filters.assignee}
        onChange={(e) => set("assignee", e.target.value)}
      >
        <option value="">All assignees</option>
        {members.map((m) => (
          <option key={m.id} value={m.name}>{m.name}</option>
        ))}
      </select>

      <select
        className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={filters.workstream}
        onChange={(e) => set("workstream", e.target.value)}
      >
        <option value="">All workstreams</option>
        {workstreams.map((w) => (
          <option key={w.id} value={w.name}>{w.name}</option>
        ))}
      </select>

      <select
        className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={filters.status}
        onChange={(e) => set("status", e.target.value as Filters["status"])}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        <span>From</span>
        <input
          type="date"
          className="border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </label>

      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        <span>To</span>
        <input
          type="date"
          className="border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </label>

      {(filters.assignee || filters.workstream || filters.status !== "all" || filters.from || filters.to) && (
        <button
          onClick={() => onChange({ assignee: "", workstream: "", status: "all", from: "", to: "" })}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
