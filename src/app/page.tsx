"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HeroPlannerCards,
  HomeHeroSection,
  useHomePlannerOverview,
} from "@/components/home";
import type { HeroPlannerHighlight } from "@/components/home";
import { PageShell, Button, ThemeToggle, Spinner } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Planner · Your day at a glance",
  description:
    "Plan your day, track goals, and review games with weekly highlights that keep the team aligned.",
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
] as const satisfies readonly HeroPlannerHighlight[];

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
          <HeroPlannerCards
            variant={themeVariant}
            plannerOverviewProps={plannerOverviewProps}
            highlights={weeklyHighlights}
            className={floatingPaddingClass}
          />
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
          <div className="flex items-center justify-center p-[var(--space-6)]">
            <Spinner />
          </div>
        </PageShell>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
