// src/components/goals/DurationSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type DurationSelectorProps = {
  options?: number[];
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
};

const DEFAULT_OPTIONS = [10, 15, 20, 25, 30, 45, 60];

export default function DurationSelector({
  options = DEFAULT_OPTIONS,
  value,
  onChange,
  disabled = false,
  className,
}: DurationSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cn("flex flex-row gap-[var(--space-3)]", className)}
    >
      {options.map((m) => {
        const active = value === m;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange?.(m)}
            role="radio"
            aria-checked={active}
            aria-disabled={disabled || undefined}
            className={cn(
              "inline-flex items-center justify-center h-[var(--control-h-sm)] px-[var(--space-3)] rounded-full text-center text-ui font-medium",
              "border transition-colors",
              "border-border/10 bg-foreground/5 text-foreground/70",
              "hover:bg-foreground/10 hover:text-foreground/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active &&
                "border-accent bg-accent/20 text-foreground/70 font-semibold"
            )}
          >
            {m}m
          </button>
        );
      })}
    </div>
  );
}
