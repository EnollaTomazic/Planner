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
      className="flex gap-2"
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
              "h-8 px-3 rounded-full text-sm flex items-center", // equal height
              "focus:ring-2 focus:ring-purple-400/60", // focus ring
              active
                ? "bg-white/10 ring-1 ring-white/20"
                : "hover:bg-white/5"
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}

