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
      role="tablist"
      aria-label="Filter goals"
      className="flex flex-col gap-2"
    >
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <div
            key={f}
            className={cn(
              "rounded-2xl",
              "focus-within:ring-2 focus-within:ring-[--theme-ring] focus-within:ring-offset-0"
            )}
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(f)}
              className={cn(
                "text-left font-mono text-sm transition",
                "px-3 py-2 rounded-2xl",
                "hover:-translate-y-px",
                "border-none outline-none focus:outline-none focus-visible:outline-none",
                active
                  ? "font-semibold text-accent bg-accent/10"
                  : undefined,
              )}
            >
              {f}
            </button>
          </div>
        );
      })}
    </div>
  );
}

