// src/components/ui/Progress.tsx
"use client";

/** Simple progress bar (0..100), with SR label */
export default function Progress({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="h-2 w-full rounded-full bg-[hsl(var(--muted))] shadow-[inset_2px_2px_4px_hsl(var(--shadow-color)/0.45),inset_-2px_-2px_4px_hsl(var(--foreground)/0.06)]"
      aria-label={label}
    >
      <div
        className="h-full w-full overflow-hidden rounded-full bg-panel/90 shadow-neo-inset"
      >
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] transition-[width] shadow-neo-sm"
          style={{ width: `${v}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          role="progressbar"
        >
          <span className="sr-only">{v}%</span>
        </span>
      </div>
    </div>
  );
}
