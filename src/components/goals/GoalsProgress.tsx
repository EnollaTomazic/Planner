"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import ProgressRingIcon from "@/icons/ProgressRingIcon";

interface GoalsProgressProps {
  total: number;
  pct: number; // 0..100
  onAddFirst?: () => void;
  maxWidth?: number | string;
}

export default function GoalsProgress({
  total,
  pct,
  onAddFirst,
  maxWidth,
}: GoalsProgressProps) {
  if (total === 0) {
    return (
      <div className="rounded-card r-card-md border border-border bg-surface-2 p-6 text-center">
        <p className="mb-4 text-muted-foreground text-ui font-medium">No goals yet.</p>
        {onAddFirst && (
          <Button onClick={onAddFirst} size="sm" className="mx-auto">
            Add a first goal
          </Button>
        )}
      </div>
    );
  }

  const v = Math.max(0, Math.min(100, Math.round(pct)));
  const size = maxWidth
    ? typeof maxWidth === "number"
      ? maxWidth
      : parseInt(maxWidth, 10)
    : 64;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Progress"
    >
      <ProgressRingIcon pct={v} size={size} />
      <span
        aria-live="polite"
        className="absolute inset-0 flex items-center justify-center text-label font-medium tracking-[0.02em] tabular-nums"
      >
        {v}%
      </span>
    </div>
  );
}
