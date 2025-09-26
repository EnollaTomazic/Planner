"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeroPlannerCards,
  HomeHeroSection,
  useHomePlannerOverview,
} from "@/components/home";
import type { HeroPlannerHighlight } from "@/components/home";
import { PageShell, Button, ThemeToggle, SectionCard } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";

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
  const heroHeadingId = "home-hero-heading";
  const overviewHeadingId = "home-overview-heading";
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

  return (
    <>
      <PageShell
        as="header"
        grid
        aria-labelledby={heroHeadingId}
        className="pt-[var(--space-6)] md:pt-[var(--space-8)]"
      >
        <SectionCard
          aria-labelledby={heroHeadingId}
          className="col-span-full"
        >
          <SectionCard.Body className="md:p-[var(--space-6)]">
            <HomeHeroSection
              variant={themeVariant}
              actions={heroActions}
              headingId={heroHeadingId}
            />
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
      <PageShell
        as="section"
        grid
        role="region"
        aria-labelledby={overviewHeadingId}
        className="mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
      >
        <SectionCard
          aria-labelledby={overviewHeadingId}
          className="col-span-full"
        >
          <SectionCard.Header
            id={overviewHeadingId}
            sticky={false}
            title="Planner overview"
            titleAs="h2"
            titleClassName="text-title font-semibold tracking-[-0.01em]"
          />
          <SectionCard.Body className="md:p-[var(--space-6)]">
            <HeroPlannerCards
              variant={themeVariant}
              plannerOverviewProps={plannerOverviewProps}
              highlights={weeklyHighlights}
            />
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  );
}

export default function Page() {
  return <HomePageContent />;
}
