"use client";

import * as React from "react";

import DashboardCard from "./DashboardCard";
import DashboardList from "./DashboardList";
import GoalsCard from "./GoalsCard";
import IsometricRoom from "./IsometricRoom";
import PlannerOverview from "./home-landing/PlannerOverview";
import type { PlannerOverviewProps } from "./home-landing";
import QuickActions from "./QuickActions";
import ReviewsCard from "./ReviewsCard";
import TeamPromptsCard from "./TeamPromptsCard";
import TodayCard from "./TodayCard";
import { layoutGridGutterClass } from "@/components/ui/layout/PageShell";
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
  highlights,
  className,
}: HeroPlannerCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-12",
        layoutGridGutterClass,
        className,
      )}
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
          "col-span-full grid grid-cols-1 md:grid-cols-12 supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
          layoutGridGutterClass,
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
        <div className="md:col-span-6 lg:col-span-4">
          <DashboardCard
            title="Weekly focus"
            cta={{ label: "Open planner", href: "/planner" }}
          >
            <DashboardList
              items={highlights}
              getKey={(highlight) => highlight.id}
              itemClassName="py-[var(--space-2)]"
              empty="No highlights scheduled"
              renderItem={(highlight) => (
                <div className="flex flex-col gap-[var(--space-2)]">
                  <div className="flex items-baseline justify-between gap-[var(--space-3)]">
                    <p className="text-ui font-medium">{highlight.title}</p>
                    <span className="text-label text-muted-foreground">
                      {highlight.schedule}
                    </span>
                  </div>
                  <p className="text-body text-muted-foreground">
                    {highlight.summary}
                  </p>
                </div>
              )}
            />
          </DashboardCard>
        </div>
        <div className="md:col-span-6 lg:col-span-8">
          <TeamPromptsCard />
        </div>
      </section>
    </div>
  );
}
