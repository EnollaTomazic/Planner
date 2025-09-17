"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";

const quickActionButtonClassName =
  "rounded-[var(--radius-2xl)] [--focus:var(--theme-ring)] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none";

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="grid gap-[var(--space-4)]">
      <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
        <Button href="/planner" className={quickActionButtonClassName}>
          Planner Today
        </Button>
        <Button href="/goals" className={quickActionButtonClassName} tone="accent">
          New Goal
        </Button>
        <Button href="/reviews" className={quickActionButtonClassName} tone="accent">
          New Review
        </Button>
      </div>
    </section>
  );
}
