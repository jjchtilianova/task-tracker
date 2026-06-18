"use client";
import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  High: "bg-red-100 text-red-700 border border-red-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low: "bg-green-100 text-green-700 border border-green-200",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority as Priority] ?? "bg-slate-100 text-slate-600"}`}>
      {priority}
    </span>
  );
}
