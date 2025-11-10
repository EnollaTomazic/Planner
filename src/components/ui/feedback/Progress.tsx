// src/components/ui/Progress.tsx
"use client";

import * as React from "react";

interface ProgressProps {
  readonly value: number;
  readonly label?: string;
}

/** Simple progress bar (0..100), with SR label */
export function Progress({ value, label }: ProgressProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="h-[var(--space-2)] w-full rounded-full bg-muted shadow-depth-inner">
      <div className="h-full w-full overflow-hidden rounded-full bg-panel/90 shadow-depth-inner">
        <span
          className={`progress-fill progress-${v} block h-full rounded-full shadow-depth-soft`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          aria-label={label}
          data-progress={v}
        >
          <span className="sr-only">{v}%</span>
        </span>
      </div>
    </div>
  );
}
