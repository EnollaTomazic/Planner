"use client";

import * as React from "react";
import { QuickActionGrid } from "./QuickActionGrid";

export function QuickActions() {
  const actions = React.useMemo(
    () => [
      {
        href: "/planner/",
        label: "Planner Today",
      },
      {
        href: "/goals/?tab=goals&intent=create-goal#goal-form",
        label: "New Goal",
        tone: "accent" as const,
      },
      {
        href: "/reviews/?intent=create-review",
        label: "New Review",
        tone: "accent" as const,
      },
    ],
    [],
  );

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
