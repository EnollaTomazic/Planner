"use client";

import * as React from "react";
import QuickActionGrid from "./QuickActionGrid";

const actions = [
  {
    href: "/planner",
    label: "Planner Today",
  },
  {
    href: "/goals",
    label: "New Goal",
    tone: "accent" as const,
  },
  {
    href: "/reviews",
    label: "New Review",
    tone: "accent" as const,
  },
];

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="grid gap-[var(--space-4)]">
      <QuickActionGrid
        actions={actions}
        className="md:flex-row md:items-center md:justify-between"
        buttonClassName="motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
      />
    </section>
  );
}
