"use client";

import * as React from "react";
import TimerRingIcon from "@/icons/TimerRingIcon";
import type { RingSize } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  pct: number; // 0..100
  className?: string;
  size?: number | RingSize;
}

export default function TimerRing({
  pct,
  className,
  size,
}: TimerRingProps) {
  const style =
    size == null
      ? undefined
      : ({
          "--timer-ring-size":
            typeof size === "number"
              ? `${size}px`
              : `var(--ring-diameter-${size})`,
        } as React.CSSProperties);

  return (
    <div
      className={cn(
        "relative aspect-square",
        className ?? "size-[var(--timer-ring-size,var(--ring-diameter-l))]",
      )}
      style={style}
    >
      <TimerRingIcon pct={pct} size={size} />
    </div>
  );
}
