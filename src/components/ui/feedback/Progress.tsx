// src/components/ui/Progress.tsx
"use client";

import * as React from "react";

/** Simple progress bar (0..100), with SR label */
export default function Progress({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const widthClass = `w-[${v}%]`;

  return (
    <div
      className="h-[var(--space-2)] w-full rounded-full bg-muted shadow-neo-inset"
    >
      <div
        className="h-full w-full overflow-hidden rounded-full bg-panel/90 shadow-neo-inset"
      >
        <span
          className={`block h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] transition-[width] shadow-neo-sm ${widthClass}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          aria-label={label}
          role="progressbar"
        >
          <span className="sr-only">{v}%</span>
        </span>
      </div>
    </div>
  );
}
