"use client";
import { useState } from "react";
import type { Task, TeamMember, Workstream } from "@/lib/types";

interface Props {
  initial?: Partial<Task>;
  members: TeamMember[];
  workstreams: Workstream[];
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ initial = {}, members, workstreams, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [assignees, setAssignees] = useState<string[]>(initial.assignees ?? []);
  const [workstream, setWorkstream] = useState(initial.workstream ?? workstreams[0]?.name ?? "");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">((initial.priority as "Low" | "Medium" | "High") ?? "Medium");
  const [startDate, setStartDate] = useState(initial.startDate ? initial.startDate.slice(0, 10) : "");
  const [completionDate, setCompletionDate] = useState(initial.completionDate ? initial.completionDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  function toggleAssignee(name: string) {
    setAssignees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description || null,
        assignees,
        workstream,
        priority: priority as Task["priority"],
        startDate: startDate || null,
        completionDate: completionDate || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Workstream</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={workstream}
            onChange={(e) => setWorkstream(e.target.value)}
          >
            {workstreams.map((w) => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
          >
            {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Assignees</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleAssignee(m.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                assignees.includes(m.name)
                  ? "text-white border-transparent"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
              }`}
              style={assignees.includes(m.name) ? { backgroundColor: m.color, borderColor: m.color } : {}}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
          <input
            type="date"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving…" : "Save task"}
        </button>
      </div>
    </form>
  );
}
