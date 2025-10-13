"use client";

import * as React from "react";
import { QuickActionGrid } from "./QuickActionGrid";

const actions = [
  {
    href: "/planner",
    label: "Planner Today",
  },
  {
    href: {
      pathname: "/goals",
      query: { tab: "goals", intent: "create-goal" },
      hash: "goal-form",
    },
    label: "New Goal",
    tone: "accent" as const,
  },
  {
    href: "/reviews?intent=create-review",
    label: "New Review",
    tone: "accent" as const,
  },
];

export function QuickActions() {
  return (
    <section aria-label="Quick actions" className="grid gap-[var(--space-4)]">
      <QuickActionGrid
        actions={actions}
        layout="inline"
        hoverLift
      />
    </section>
  );
}
