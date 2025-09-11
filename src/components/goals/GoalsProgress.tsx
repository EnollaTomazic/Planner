"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";

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
        <p className="mb-4 text-sm text-fg-muted">No goals yet.</p>
        {onAddFirst && (
          <Button onClick={onAddFirst} size="sm" className="mx-auto rounded-xl">
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
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Progress"
    >
      <svg
        className="h-full w-full rotate-[-90deg]"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={4}
          className="text-fg/20"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent)]"
          fill="none"
        />
      </svg>
      <span
        aria-live="polite"
        className="absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums"
      >
        {v}%
      </span>
    </div>
  );
}
