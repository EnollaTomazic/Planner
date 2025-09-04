// src/components/ui/Progress.tsx
"use client";

import { cn } from "@/lib/utils";

/** Simple progress bar (0..100), with SR label */
export default function Progress({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("h-2 w-full rounded-full bg-muted", className)} aria-label={label}>
      <div
        className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width]"
        style={{ width: `${v}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        role="progressbar"
      >
        <span className="sr-only">{v}%</span>
      </div>
    </div>
  );
}
