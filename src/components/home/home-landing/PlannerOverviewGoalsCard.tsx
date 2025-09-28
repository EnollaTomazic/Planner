"use client";

import * as React from "react";
import { NeoCard } from "@/components/ui";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import type { PlannerOverviewGoalsProps } from "./types";

function PlannerOverviewGoalsCardComponent({
  label,
  title,
  completed,
  total,
  percentage,
  active,
  emptyMessage,
  allCompleteMessage,
}: PlannerOverviewGoalsProps) {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4">
      <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
        <header className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-label text-muted-foreground">{label}</p>
            <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
              {title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-label text-muted-foreground">Completed</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {completed}/{total}
            </p>
          </div>
        </header>
        <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:gap-[var(--space-5)]">
          <div className="flex items-center justify-center">
            <div className="relative flex size-[var(--ring-diameter-m)] items-center justify-center">
              <ProgressRingIcon pct={percentage} size="m" />
              <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
                {total === 0 ? "0%" : `${percentage}%`}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-[var(--space-3)]">
            {total === 0 ? (
              <p className="text-label text-muted-foreground">{emptyMessage}</p>
            ) : active.length > 0 ? (
              active.map((goal) => (
                <div key={goal.id} className="space-y-[var(--space-1)]">
                  <p className="text-ui font-medium text-card-foreground">{goal.title}</p>
                  {goal.detail ? (
                    <p className="text-label text-muted-foreground">{goal.detail}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-label text-muted-foreground">{allCompleteMessage}</p>
            )}
          </div>
        </div>
      </NeoCard>
    </div>
  );
}

export default React.memo(PlannerOverviewGoalsCardComponent);
