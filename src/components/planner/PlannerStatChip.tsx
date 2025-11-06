"use client";

import * as React from "react";

import { GlitchProgress } from "@/components/ui/primitives/GlitchProgress";
import { cn } from "@/lib/utils";

import styles from "./PlannerStatChip.module.css";

export interface PlannerStatChipProps {
  label: string;
  value: string;
  /**
   * Optional accessible label describing the stat. Falls back to `${value} ${label}`.
   */
  ariaLabel?: string;
  className?: string;
  current?: number;
  total?: number;
}

export function PlannerStatChip({
  label,
  value,
  ariaLabel,
  className,
  current,
  total,
}: PlannerStatChipProps) {
  const descriptionId = React.useId();
  const announcement = ariaLabel ?? `${value} ${label}`;
  const hasProgress =
    Number.isFinite(current) && Number.isFinite(total);
  const progressCurrent = hasProgress ? Number(current) : 0;
  const progressTotal = hasProgress ? Number(total) : 0;

  return (
    <div
      className={cn(
        "chip chip-token chip-surface chip-border chip-ring",
        styles.root,
        className,
      )}
      tabIndex={0}
      role="status"
      aria-labelledby={descriptionId}
      aria-live="polite"
    >
      <span id={descriptionId} className="sr-only">
        {announcement}
      </span>
      <span aria-hidden className={styles.value}>
        {value}
      </span>
      <span aria-hidden className={styles.label}>
        {label}
      </span>
      {hasProgress ? (
        <div className={styles.progressDial} aria-hidden>
          <GlitchProgress value={progressCurrent} max={progressTotal} size="sm" />
        </div>
      ) : null}
    </div>
  );
}
