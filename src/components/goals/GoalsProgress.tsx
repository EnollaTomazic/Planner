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
      <div className="border border-dashed border-foreground/20 rounded-2xl p-6 text-center">
        <p className="mb-4 text-sm text-foreground/60">No goals yet.</p>
        {onAddFirst && (
          <Button onClick={onAddFirst} className="mx-auto" size="sm">
            Add a first goal
          </Button>
        )}
      </div>
    );
  }

  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="flex min-w-[120px] items-center gap-2" aria-label="Progress">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-1.5 rounded-full bg-accent transition-[width]"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-foreground/60">{v}%</span>
    </div>
  );
}

