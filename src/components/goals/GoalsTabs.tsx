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
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f)}
            className={cn(
              "text-left font-mono text-sm transition",
              "px-3 py-2 rounded-2xl",
              "hover:-translate-y-px hover:ring-1 hover:ring-[hsl(var(--ring))]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
              active
                ? "font-semibold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]"
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

