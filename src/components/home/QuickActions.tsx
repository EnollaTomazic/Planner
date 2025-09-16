"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import Link from "next/link";

const quickActionButtonClassName =
  "rounded-[var(--radius-2xl)] [--focus:var(--theme-ring)] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none";

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="grid gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href="/planner">
          <Button className={quickActionButtonClassName}>
            Planner Today
          </Button>
        </Link>
        <Link href="/goals">
          <Button className={quickActionButtonClassName} tone="accent">
            New Goal
          </Button>
        </Link>
        <Link href="/reviews">
          <Button className={quickActionButtonClassName} tone="accent">
            New Review
          </Button>
        </Link>
      </div>
    </section>
  );
}
