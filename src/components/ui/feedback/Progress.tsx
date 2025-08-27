// src/components/ui/Progress.tsx
"use client";

/** Simple progress bar (0..100), with SR label */
export default function Progress({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full rounded-full bg-muted" aria-label={label}>
      <div
        className="h-2 rounded-full bg-[hsl(var(--primary))] transition-[width]"
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
