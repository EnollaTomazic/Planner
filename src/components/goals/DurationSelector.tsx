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
    <div className={cn("flex flex-row gap-3", className)}>
      {options.map((m) => {
        const active = value === m;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange?.(m)}
            className={cn(
              "inline-flex items-center justify-center h-9 px-3 rounded-full text-center text-sm",
              "border transition-colors",
              "border-[hsl(var(--border)/0.1)] bg-[hsl(var(--foreground)/0.05)] text-[hsl(var(--foreground)/0.7)]",
              "hover:bg-[hsl(var(--foreground)/0.10)] hover:text-[hsl(var(--foreground)/0.70)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
              active &&
                "border-purple-400/60 bg-purple-500/20 text-[hsl(var(--foreground)/0.70)] font-semibold"
            )}
          >
            {m}m
          </button>
        );
      })}
    </div>
  );
}
