"use client";

import * as React from "react";

import ActivityCard from "./ActivityCard";
import GoalsCard from "./GoalsCard";
import IsometricRoom from "./IsometricRoom";
import PlannerOverview from "./home-landing/PlannerOverview";
import type { PlannerOverviewProps } from "./home-landing";
import QuickActions from "./QuickActions";
import ReviewsCard from "./ReviewsCard";
import TeamPromptsCard from "./TeamPromptsCard";
import TodayCard from "./TodayCard";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface HeroPlannerHighlight {
  id: string;
  title: string;
  schedule: string;
  summary: string;
}

export interface HeroPlannerCardsProps {
  variant: Variant;
  plannerOverviewProps: PlannerOverviewProps;
  highlights: readonly HeroPlannerHighlight[];
  className?: string;
}

export default function HeroPlannerCards({
  variant,
  plannerOverviewProps,
  highlights: _highlights,
  className,
}: HeroPlannerCardsProps) {
  const { activity } = plannerOverviewProps;
  void _highlights;

  const activityColumnClass = activity.hasData || activity.loading
    ? "col-span-full md:col-span-6 lg:col-span-4"
    : "col-span-full";
  const promptsColumnClass = activity.hasData || activity.loading
    ? "col-span-full md:col-span-6 lg:col-span-8"
    : "col-span-full";

  return (
    <div
      className={cn(layoutGridClassName, "md:grid-cols-12", className)}
    >
      <div
        className="col-span-full grid items-start gap-[var(--space-4)] md:grid-cols-12 supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]"
      >
        <div className="md:col-span-6">
          <QuickActions />
        </div>
        <div className="md:col-span-6">
          <IsometricRoom variant={variant} />
        </div>
      </div>
      <PlannerOverview
        {...plannerOverviewProps}
        className="pt-[var(--space-4)]"
      />
      <section
        className={cn(
          layoutGridClassName,
          "col-span-full md:grid-cols-12 supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
        )}
      >
        <div className="md:col-span-4">
          <TodayCard />
        </div>
        <div className="md:col-span-4">
          <GoalsCard />
        </div>
        <div className="md:col-span-4">
          <ReviewsCard />
        </div>
        <div className={activityColumnClass}>
          <ActivityCard {...activity} />
        </div>
        <div className={promptsColumnClass}>
          <TeamPromptsCard />
        </div>
      </section>
    </div>
  );
}
