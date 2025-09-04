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
      <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-white/60 mb-4">No goals yet.</p>
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
    <div className="flex items-center gap-2 min-w-[120px]" aria-label="Progress">
      <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-[hsl(var(--primary))] transition-[width]"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="text-xs text-white/60 tabular-nums">{v}%</span>
    </div>
  );
}

