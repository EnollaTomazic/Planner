"use client";

import * as React from "react";
import PlannerOverviewCalendarCard from "./PlannerOverviewCalendarCard";
import PlannerOverviewFocusCard from "./PlannerOverviewFocusCard";
import PlannerOverviewGoalsCard from "./PlannerOverviewGoalsCard";
import PlannerOverviewSummaryCard from "./PlannerOverviewSummaryCard";
import type { PlannerOverviewProps } from "./types";
import { cn } from "@/lib/utils";

interface PlannerOverviewComponentProps extends PlannerOverviewProps {
  className?: string;
}

export default function PlannerOverview({
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
        <PlannerOverviewSummaryCard {...summary} />
        <PlannerOverviewFocusCard {...focus} />
        <PlannerOverviewGoalsCard {...goals} />
        <PlannerOverviewCalendarCard {...calendar} />
      </div>
    ),
    [calendar, className, focus, goals, summary],
  );
}
