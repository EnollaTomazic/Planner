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
import { Button } from "@/components/ui";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";
import styles from "./HeroPlannerCards.module.css";

export interface HeroPlannerCardsProps {
  variant: Variant;
  plannerOverviewProps: PlannerOverviewProps;
  className?: string;
}

const HeroPlannerCards = React.memo(function HeroPlannerCards({
  variant,
  plannerOverviewProps,
  className,
}: HeroPlannerCardsProps) {
  const { activity } = plannerOverviewProps;

  const activityColumnClass = activity.hasData || activity.loading
    ? "col-span-full md:col-span-6 lg:col-span-4"
    : "col-span-full";
  const promptsColumnClass = activity.hasData || activity.loading
    ? "col-span-full md:col-span-6 lg:col-span-8"
    : "col-span-full";

  return (
    <section className={cn(styles.root, className)}>
      <div
        className={cn(
          layoutGridClassName,
          styles.shell,
          "md:grid-cols-12 supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
        )}
      >
        <div className={cn("col-span-full", styles.widgetRow)}>
          <div className={cn("md:col-span-6", styles.splitHalf)}>
            <div className={styles.section}>
              <p className={styles.sectionHeading}>Quick calibrations</p>
              <QuickActions />
            </div>
          </div>
          <div className={cn("md:col-span-6", styles.splitHalf)}>
            <div className={styles.section}>
              <p className={styles.sectionHeading}>Ambient room</p>
              <IsometricRoom variant={variant} />
            </div>
          </div>
        </div>
        <div className="col-span-full">
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Planner overview</p>
            <PlannerOverview
              {...plannerOverviewProps}
              className={styles.miniGrid}
            />
          </div>
        </div>
        <div className={cn("col-span-full", styles.miniGrid)}>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Today focus</p>
            <TodayCard />
          </div>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Goals pulse</p>
            <GoalsCard />
          </div>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Highlights</p>
            <ReviewsCard />
          </div>
          <div className={cn(styles.section, activityColumnClass)}>
            <p className={styles.sectionHeading}>Activity trace</p>
            <ActivityCard {...activity} />
          </div>
          <div className={cn(styles.section, promptsColumnClass)}>
            <p className={styles.sectionHeading}>Prompts orbit</p>
            <TeamPromptsCard />
          </div>
        </div>
        <div className="col-span-full">
          <div className={styles.aiPanel}>
            <div className={styles.aiHeader}>
              <span className={styles.aiChip}>AI draft</span>
              <p className="text-ui text-foreground">
                Agnes and Noxi surfaced three momentum bets. Everything stays editable, retryable, and dismissible.
              </p>
            </div>
            <div className={styles.aiActions}>
              <Button size="sm" variant="ghost" tone="accent">
                Retry
              </Button>
              <Button size="sm" variant="default" tone="accent">
                Edit draft
              </Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
            <p className={styles.aiHint}>
              Confidence: medium. Suggestions will adapt once you complete today’s plan or dismiss items manually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroPlannerCards.displayName = "HeroPlannerCards";

export default HeroPlannerCards;
