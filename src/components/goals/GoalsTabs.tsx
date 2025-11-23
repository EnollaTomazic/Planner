"use client";

import * as React from "react";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/ui/primitives/SegmentedControl";

export type GoalsTabKey = "goals" | "reminders" | "timer";

const OPTIONS: ReadonlyArray<SegmentedControlOption<GoalsTabKey>> = [
  { label: "Goals", value: "goals" },
  { label: "Reminders", value: "reminders" },
  { label: "Timer", value: "timer" },
];

interface GoalsTabsProps {
  value: GoalsTabKey;
  onChange: (value: GoalsTabKey) => void;
  idBase?: string;
  className?: string;
}

export function GoalsTabs({ value, onChange, idBase, className }: GoalsTabsProps) {
  return (
    <SegmentedControl<GoalsTabKey>
      value={value}
      onValueChange={onChange}
      options={OPTIONS}
      ariaLabel="Toggle goals, reminders, or timer"
      idBase={idBase}
      className={className}
    />
  );
}
