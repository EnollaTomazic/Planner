"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import Link from "next/link";

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="grid gap-4">
      <div className="flex flex-col gap-4">
        <Link href="/planner">
          <Button className="rounded-full focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none">
            Planner Today
          </Button>
        </Link>
        <Link href="/goals">
          <Button className="rounded-full focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none" tone="accent">
            New Goal
          </Button>
        </Link>
        <Link href="/reviews">
          <Button className="rounded-full focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none" tone="accent">
            New Review
          </Button>
        </Link>
      </div>
    </section>
  );
}
