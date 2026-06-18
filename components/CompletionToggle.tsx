"use client";
import { useState } from "react";

interface Props {
  completed: boolean;
  onChange: (completed: boolean) => void;
}

export function CompletionToggle({ completed, onChange }: Props) {
  const [animating, setAnimating] = useState(false);

  function handleClick() {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 220);
    onChange(!completed);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={completed ? "Mark incomplete" : "Mark complete"}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        animating ? "check-animate" : ""
      } ${
        completed
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "border-slate-300 hover:border-indigo-400 bg-white"
      }`}
    >
      {completed && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <polyline points="2,6 5,9 10,3" />
        </svg>
      )}
    </button>
  );
}
