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
      <div className="rounded-card r-card-md border border-border bg-surface-2 p-[var(--space-6)] text-center">
        <p className="mb-[var(--space-4)] text-muted-foreground text-ui font-medium">No goals yet.</p>
        {onAddFirst && (
          <Button onClick={onAddFirst} size="sm" className="mx-auto">
            Add a first goal
          </Button>
        )}
      </div>
    );
  }

  const v = Math.max(0, Math.min(100, Math.round(pct)));
  const customSize =
    maxWidth == null
      ? undefined
      : typeof maxWidth === "number"
        ? `${maxWidth}px`
        : maxWidth;
  const ringSize = typeof maxWidth === "number" ? maxWidth : undefined;
  return (
    <div
      className="relative inline-flex size-[var(--goals-progress-size,var(--space-8))] items-center justify-center"
      style={
        customSize
          ? ({
              "--goals-progress-size": customSize,
            } as React.CSSProperties)
          : undefined
      }
      aria-label="Progress"
    >
      <ProgressRingIcon pct={v} size={ringSize} />
      <span
        aria-live="polite"
        className="absolute inset-0 flex items-center justify-center text-label font-medium tracking-[0.02em] tabular-nums"
      >
        {v}%
      </span>
    </div>
  );
}
