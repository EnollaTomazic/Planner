"use client";

import * as React from "react";
import { Card } from "../Card";
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
        <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
          <SummaryCard {...summary} />
        </Card>
        <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
          <FocusCard {...focus} />
        </Card>
        <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
          <MomentumCard {...goals} />
        </Card>
        <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
          <CalendarCard {...calendar} />
        </Card>
      </div>
    ),
    [calendar, className, focus, goals, summary],
  );
}
