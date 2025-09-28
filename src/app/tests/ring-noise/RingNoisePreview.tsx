"use client";

import ProgressRingIcon from "@/icons/ProgressRingIcon";
import TimerRingIcon from "@/icons/TimerRingIcon";

export default function RingNoisePreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div
        data-testid="ring-noise-surface"
        className="grid grid-cols-2 gap-[var(--space-4)] rounded-card r-card-lg border border-[hsl(var(--card-hairline)/0.6)] bg-[hsl(var(--surface-2)/0.7)] p-[var(--space-5)] shadow-[var(--shadow-inset-hairline)]"
      >
        <div className="flex size-[var(--space-12)] items-center justify-center">
          <TimerRingIcon pct={75} />
        </div>
        <div className="flex size-[var(--space-12)] items-center justify-center">
          <ProgressRingIcon pct={60} />
        </div>
      </div>
    </div>
  );
}
