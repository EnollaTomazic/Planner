"use client";

import * as React from "react";
import { QuickActionGrid } from "./QuickActionGrid";
import useBasePath from "@/lib/useBasePath";

export function QuickActions() {
  const { withBasePath } = useBasePath();

  const actions = React.useMemo(
    () => [
      {
        href: withBasePath("/planner/"),
        label: "Planner Today",
      },
      {
        href: `${withBasePath("/goals/")}?tab=goals&intent=create-goal#goal-form`,
        label: "New Goal",
        tone: "accent" as const,
      },
      {
        href: `${withBasePath("/reviews/")}?intent=create-review`,
        label: "New Review",
        tone: "accent" as const,
      },
    ],
    [withBasePath],
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
