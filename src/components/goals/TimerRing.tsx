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
  const reactId = React.useId();
  const ringInstanceId = React.useMemo(
    () => reactId.replace(/[:]/g, "_"),
    [reactId],
  );
  const customSizeValue = React.useMemo(() => {
    if (size == null) {
      return null;
    }
    if (typeof size === "number") {
      return Number.isFinite(size) ? `${size}px` : null;
    }

    return `var(--ring-diameter-${size})`;
  }, [size]);
  const hasCustomSize = customSizeValue !== null;
  const ringIconSize =
    typeof size === "number"
      ? Number.isFinite(size)
        ? size
        : undefined
      : size;

  return (
    <>
      <div
        className={cn(
          "relative aspect-square",
          className ?? "size-[var(--timer-ring-size,var(--ring-diameter-l))]",
        )}
        data-ring-instance={hasCustomSize ? ringInstanceId : undefined}
      >
        <TimerRingIcon pct={pct} size={ringIconSize} />
      </div>
      {hasCustomSize ? (
        <style jsx global>{`
          [data-ring-instance="${ringInstanceId}"] {
            --timer-ring-size: ${customSizeValue};
          }
        `}</style>
      ) : null}
    </>
  );
}
