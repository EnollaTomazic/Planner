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
        <SummaryCard
          {...summary}
          cardProps={{ className: "col-span-12 h-full md:col-span-6 lg:col-span-4" }}
        />
        <FocusCard
          {...focus}
          cardProps={{ className: "col-span-12 h-full md:col-span-6 lg:col-span-4" }}
        />
        <MomentumCard
          {...goals}
          cardProps={{ className: "col-span-12 h-full md:col-span-6 lg:col-span-4" }}
        />
        <CalendarCard
          {...calendar}
          cardProps={{ className: "col-span-12 h-full md:col-span-6 lg:col-span-4" }}
        />
      </div>
    ),
    [calendar, className, focus, goals, summary],
  );
}
