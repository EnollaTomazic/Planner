"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();
  const goPlanner = React.useCallback(() => router.push("/planner"), [router]);
  const goGoals = React.useCallback(() => router.push("/goals"), [router]);
  const goReviews = React.useCallback(() => router.push("/reviews"), [router]);

  return (
    <section aria-label="Quick actions" className="grid gap-4">
      <div className="flex flex-col gap-4">
        <Button shape="pill" onClick={goPlanner}>
          Planner Today
        </Button>
        <Button shape="pill" tone="accent" onClick={goGoals}>
          New Goal
        </Button>
        <Button shape="pill" tone="accent" onClick={goReviews}>
          New Review
        </Button>
      </div>
    </section>
  );
}
