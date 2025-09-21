"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
  DashboardCard,
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  IsometricRoom,
  DashboardList,
  HomeHeroSection,
  PlannerOverview,
  useHomePlannerOverview,
} from "@/components/home";
import { PageShell, Button, ThemeToggle, Spinner } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

type WeeklyHighlight = {
  id: string;
  title: string;
  schedule: string;
  summary: string;
};

const weeklyHighlights = [
  {
    id: "strategy-sync",
    title: "Strategy sync",
    schedule: "Today · 3:00 PM",
    summary: "Align backlog for the Q2 milestone and confirm owners.",
  },
  {
    id: "retro",
    title: "Sprint retro",
    schedule: "Wed · 11:00 AM",
    summary: "Collect insights to finalize review prompts and next sprint goals.",
  },
  {
    id: "review-window",
    title: "Review window",
    schedule: "Fri · All day",
    summary: "Encourage the team to log highlights before the week wraps.",
  },
] as const satisfies readonly WeeklyHighlight[];

function HomePageContent() {
  const [theme] = useTheme();
  useThemeQuerySync();

  return (
    <PlannerProvider>
      <HomePageBody themeVariant={theme.variant} />
    </PlannerProvider>
  );
}

function HomePageBody({ themeVariant }: { themeVariant: Variant }) {
  const plannerOverviewProps = useHomePlannerOverview();
  const heroActions = React.useMemo<React.ReactNode>(
    () => (
      <>
        <ThemeToggle className="shrink-0" />
        <Button
          asChild
          variant="primary"
          size="md"
          tactile
          className="whitespace-nowrap"
        >
          <Link href="/planner">Plan Week</Link>
        </Button>
      </>
    ),
    [],
  );

  const heroSurfaceClass =
    "relative z-10 isolate rounded-[var(--radius-2xl)] bg-card/30 shadow-neoSoft backdrop-blur-lg";
  const contentSurfaceClass =
    "relative z-10 isolate rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 shadow-neoSoft backdrop-blur-lg";
  const floatingPaddingClass =
    "p-[var(--space-4)] md:p-[var(--space-5)]";

  return (
    <PageShell
      as="main"
      aria-labelledby="home-header"
      className="py-[var(--space-6)] md:pb-[var(--space-8)]"
    >
      <div className="relative isolate rounded-[var(--radius-2xl)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-border/40 bg-panel/70 shadow-neo-inset"
        />
        <div className="relative space-y-[var(--space-6)] p-[var(--space-4)] md:space-y-[var(--space-8)] md:p-[var(--space-5)]">
          <div className={cn(heroSurfaceClass, floatingPaddingClass)}>
            <HomeHeroSection variant={themeVariant} actions={heroActions} />
          </div>
          <div
            className={cn(
              "space-y-[var(--space-7)]",
              contentSurfaceClass,
              floatingPaddingClass,
            )}
          >
            <div className="grid items-start gap-[var(--space-4)] md:grid-cols-12">
              <div className="md:col-span-6">
                <QuickActions />
              </div>
              <div className="md:col-span-6">
                <IsometricRoom variant={themeVariant} />
              </div>
            </div>
            <div className="pt-[var(--space-4)]">
              <PlannerOverview {...plannerOverviewProps} />
            </div>
            <section className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
              <div className="md:col-span-4">
                <TodayCard />
              </div>
              <div className="md:col-span-4">
                <GoalsCard />
              </div>
              <div className="md:col-span-4">
                <ReviewsCard />
              </div>
              <div className="md:col-span-4">
                <DashboardCard
                  title="Weekly focus"
                  cta={{ label: "Open planner", href: "/planner" }}
                >
                  <DashboardList
                    items={weeklyHighlights}
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
              <div className="md:col-span-12">
                <TeamPromptsCard />
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageShell as="main" aria-busy="true">
          <div className="flex justify-center p-[var(--space-6)]">
            <Spinner />
          </div>
        </PageShell>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
