"use client";

import * as React from "react";
import PlannerOverviewCalendarCard from "./PlannerOverviewCalendarCard";
import PlannerOverviewFocusCard from "./PlannerOverviewFocusCard";
import PlannerOverviewGoalsCard from "./PlannerOverviewGoalsCard";
import PlannerOverviewSummaryCard from "./PlannerOverviewSummaryCard";
import type { PlannerOverviewProps } from "./types";

export default function PlannerOverview({
  summary,
  focus,
  goals,
  calendar,
}: PlannerOverviewProps) {
  return React.useMemo(
    () => (
      <div className="grid grid-cols-12 gap-[var(--space-5)]">
        <PlannerOverviewSummaryCard {...summary} />
        <PlannerOverviewFocusCard {...focus} />
        <PlannerOverviewGoalsCard {...goals} />
        <PlannerOverviewCalendarCard {...calendar} />
      </div>
    ),
    [calendar, focus, goals, summary],
  );
}
