"use client";

import * as React from "react";
import type { Goal } from "@/lib/types";

interface GoalSlotProps {
  goal?: Goal | null;
  idx: number;
}

export default function GoalSlot({ goal, idx }: GoalSlotProps) {
  const num = String(idx + 1).padStart(2, "0");
  const file = `GoalSlot_${num}.exe`;
  const code = `HQ0${num}`;
  return (
    <div
      className="goal-card group shadow-neoSoft hover:-translate-y-px hover:ring-1 hover:ring-[hsl(var(--accent))] focus-within:ring-2 focus-within:ring-[hsl(var(--accent))]"
    >
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="h-2 w-2 rounded-sm bg-[hsl(var(--accent))]" aria-hidden />
          <span className="truncate">{file}</span>
        </div>
        <span>{code}</span>
      </header>
      <div className="p-4 font-mono text-xs text-[hsl(var(--fg-muted))]">
        {goal ? (
          <>
            <span className="text-[hsl(var(--fg))]">{`function goal_${num}() {`}</span>
            <br />
            <span className="pl-4 text-[hsl(var(--fg))]">{`return "${goal.title}";`}</span>
            <br />
            {goal.notes ? (
              <>
                <span className="pl-4 text-[hsl(var(--fg-muted))]">{`// ${goal.notes}`}</span>
                <br />
              </>
            ) : null}
            <span className="text-[hsl(var(--fg))]">{`}`}</span>
          </>
        ) : (
          <>
            <span>{`// ERROR: NO_GOALS_FOUND`}</span>
            <br />
            <span>{`// Add goals to fill slots`}</span>
          </>
        )}
      </div>
      <footer className="relative h-2 overflow-hidden rounded-b-2xl bg-[hsl(var(--surface))]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,hsl(var(--accent)/0.4)_0_8px,transparent_8px_16px)] animate-[slot-stripes_1s_linear_infinite] motion-reduce:animate-none" />
      </footer>
      <style jsx>{`
        @keyframes slot-stripes {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 rounded-2xl before:absolute before:top-1 before:left-1 before:h-2 before:w-2 before:border-t before:border-l before:border-[hsl(var(--border))] after:absolute after:bottom-1 after:right-1 after:h-2 after:w-2 after:border-b after:border-r after:border-[hsl(var(--border))]" aria-hidden />
    </div>
  );
}
