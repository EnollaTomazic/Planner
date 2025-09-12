"use client";

import * as React from "react";
import TabBar, { type TabItem } from "@/components/ui/layout/TabBar";

export type FilterKey = "All" | "Active" | "Done";

const FILTER_ITEMS: TabItem<FilterKey>[] = [
  { key: "All", label: "All" },
  { key: "Active", label: "Active" },
  { key: "Done", label: "Done" },
];

interface GoalsTabsProps {
  value: FilterKey;
  onChange: (val: FilterKey) => void;
}

export default function GoalsTabs({ value, onChange }: GoalsTabsProps) {
  return (
    <TabBar<FilterKey>
      items={FILTER_ITEMS}
      value={value}
      onValueChange={onChange}
      size="sm"
      ariaLabel="Filter goals"
      linkPanels={false}
    />
  );
}
