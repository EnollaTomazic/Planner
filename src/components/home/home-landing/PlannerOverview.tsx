"use client";

import * as React from "react";
import { CalendarCard, FocusCard, MomentumCard, SummaryCard } from "./cards";
import type { PlannerOverviewProps } from "./types";
import { cn } from "@/lib/utils";

interface PlannerOverviewComponentProps extends PlannerOverviewProps {
  className?: string;
}

export function PlannerOverview({
  summary,
  focus,
  goals,
  calendar,
  className,
}: PlannerOverviewComponentProps) {
  return React.useMemo(
    () => (
      <div
        className={cn(
          "col-span-full grid grid-cols-12 gap-[var(--space-5)]",
          "supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
          className,
        )}
      >
        <SummaryCard {...summary} />
        <FocusCard {...focus} />
        <MomentumCard {...goals} />
        <CalendarCard {...calendar} />
      </div>
    ),
    [calendar, className, focus, goals, summary],
  );
}
