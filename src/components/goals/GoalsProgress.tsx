"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/button";

interface GoalsProgressProps {
  total: number;
  pct: number; // 0..100
  onAddFirst?: () => void;
}

export default function GoalsProgress({ total, pct, onAddFirst }: GoalsProgressProps) {
  if (total === 0) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-6 text-center">
        <p className="mb-4 text-sm text-[hsl(var(--fg-muted))]">No goals yet.</p>
        {onAddFirst && (
          <Button onClick={onAddFirst} size="sm" className="mx-auto rounded-xl">
            Add a first goal
          </Button>
        )}
      </div>
    );
  }

  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="flex min-w-[120px] items-center gap-2" aria-label="Progress">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[hsl(var(--fg)/0.1)]">
        <div
          className="h-1.5 rounded-full bg-[hsl(var(--accent))] transition-[width]"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-[hsl(var(--fg)/0.6)]">{v}%</span>
    </div>
  );
}

