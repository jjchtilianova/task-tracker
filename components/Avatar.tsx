"use client";
import type { TeamMember } from "@/lib/types";

export function Avatar({ member, size = "sm" }: { member: TeamMember; size?: "sm" | "md" }) {
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${dim}`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {initials}
    </span>
  );
}
