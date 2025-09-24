"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
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

  const frameClass = "relative isolate rounded-[var(--radius-2xl)]";
  const frameBackdropClass =
    "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-border/40 bg-panel/70 shadow-neo-inset";
  const frameContentClass =
    "relative space-y-[var(--space-6)] p-[var(--space-4)] md:space-y-[var(--space-8)] md:p-[var(--space-5)]";
  const renderFramedSection = (content: React.ReactNode) => (
    <div className={frameClass}>
      <div aria-hidden className={frameBackdropClass} />
      <div className={frameContentClass}>{content}</div>
    </div>
  );

  return (
    <>
      <PageShell
        as="header"
        aria-labelledby="home-header"
        padding={{ top: 6, bottom: 0 }}
      >
        {renderFramedSection(
          <div className={cn(heroSurfaceClass, floatingPaddingClass)}>
            <HomeHeroSection variant={themeVariant} actions={heroActions} />
          </div>,
        )}
      </PageShell>
      <PageShell
        as="section"
        role="region"
        aria-labelledby="home-header"
        className="mt-[var(--space-6)] md:mt-[var(--space-8)]"
        padding={{ top: 0, bottom: 6 }}
        slots={{ root: "md:[--page-shell-block-end:var(--space-8)]" }}
      >
        {renderFramedSection(
          <HeroPlannerCards
            variant={themeVariant}
            plannerOverviewProps={plannerOverviewProps}
            highlights={weeklyHighlights}
            className={floatingPaddingClass}
          />,
        )}
      </PageShell>
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageShell as="section" aria-busy="true" role="status">
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
