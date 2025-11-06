"use client";

import * as React from "react";
import { Circle, CircleDot, CircleCheck } from "lucide-react";

import {
  GlitchSegmentedButton,
  GlitchSegmentedGroup,
} from "@/components/ui/primitives/GlitchSegmented";

export type FilterKey = "All" | "Active" | "Done";

const FILTER_ITEMS: Array<{
  key: FilterKey;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  { key: "All", label: "All", Icon: Circle },
  { key: "Active", label: "Active", Icon: CircleDot },
  { key: "Done", label: "Done", Icon: CircleCheck },
];

interface GoalsTabsProps {
  value: FilterKey;
  onChange: (val: FilterKey) => void;
}

export function GoalsTabs({ value, onChange }: GoalsTabsProps) {
  return (
    <GlitchSegmentedGroup
      value={value}
      onChange={(next) => onChange(next as FilterKey)}
      aria-label="Filter goals"
    >
      {FILTER_ITEMS.map(({ key, label, Icon }) => (
        <GlitchSegmentedButton key={key} value={key}>
          <Icon aria-hidden="true" className="size-[var(--icon-size-sm)]" />
          {label}
        </GlitchSegmentedButton>
      ))}
    </GlitchSegmentedGroup>
  );
}
