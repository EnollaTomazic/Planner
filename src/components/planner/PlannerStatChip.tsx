import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./PlannerStatChip.module.css";

export interface PlannerStatChipProps {
  label: string;
  value: string;
  /**
   * Screen reader description that expands on the label/value pair.
   * When omitted, the component falls back to an auto-generated phrase.
   */
  assistiveText?: string;
  className?: string;
}

export function PlannerStatChip({
  label,
  value,
  assistiveText,
  className,
}: PlannerStatChipProps) {
  const helperId = React.useId();
  const description = assistiveText ?? `${label}: ${value}`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-describedby={helperId}
      tabIndex={0}
      className={cn(styles.chip, className)}
    >
      <span className={styles.label}>{label}</span>
      <span aria-hidden className={styles.value}>
        {value}
      </span>
      <span id={helperId} className={styles.helper}>
        {description}
      </span>
    </div>
  );
}
