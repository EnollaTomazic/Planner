"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type FilterKey = "All" | "Active" | "Done";
const FILTERS: FilterKey[] = ["All", "Active", "Done"];

interface GoalsTabsProps {
  value: FilterKey;
  onChange: (val: FilterKey) => void;
}

export default function GoalsTabs({ value, onChange }: GoalsTabsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter goals"
      className="flex flex-row gap-3"
    >
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f)}
            className={cn(
              "text-left font-mono text-sm transition",
              "px-3 py-2 rounded-2xl",
              "motion-safe:hover:-translate-y-px",
              "border-none outline-none focus:outline-none focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[--theme-ring]",
              active
                ? "font-semibold text-accent bg-accent/10"
                : undefined,
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
