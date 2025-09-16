"use client";

import Link from "next/link";
import * as React from "react";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import type { Goal } from "@/lib/types";
import { Progress } from "@/components/ui";
import { CircleSlash } from "lucide-react";

export default function GoalsCard() {
  const [goals] = usePersistentState<Goal[]>("goals.v2", []);
  const activeGoals = React.useMemo(
    () => goals.filter((g) => !g.done).slice(0, 3),
    [goals],
  );

  return (
    <DashboardCard
      title="Active goals"
      cta={{ label: "Manage Goals", href: "/goals" }}
    >
      <ul className="divide-y divide-[hsl(var(--border))]">
        {activeGoals.map((g) => (
          <li key={g.id} className="py-2">
            <p className="text-ui">{g.title}</p>
            <div className="mt-2">
              <Progress value={0} />
            </div>
          </li>
        ))}
        {activeGoals.length === 0 && (
          <li className="flex justify-between py-2 text-ui text-muted-foreground">
            <span className="flex items-center gap-2">
              <CircleSlash className="size-3" />
              No active goals
            </span>
            <Link
              href="/goals"
              className="inline-flex items-center text-label font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-foreground active:text-accent active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-reduce:transition-none"
            >
              Create
            </Link>
          </li>
        )}
      </ul>
    </DashboardCard>
  );
}
