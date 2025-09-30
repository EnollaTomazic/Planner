"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeroPlannerCards,
  HomeHeroSection,
  HomeSplash,
  useHomePlannerOverview,
} from "@/components/home";
import type { HeroPlannerHighlight, PlannerOverviewProps } from "@/components/home";
import { PageShell, Button, ThemeToggle, SectionCard } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme, useUiFeatureFlags } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";
import styles from "./page-client.module.css";

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
  const { glitchLandingEnabled } = useUiFeatureFlags();
  useThemeQuerySync();

  return (
    <PlannerProvider>
      <HomePagePlannerContent
        themeVariant={theme.variant}
        glitchLandingEnabled={glitchLandingEnabled}
      />
    </PlannerProvider>
  );
}

type HomePagePlannerContentProps = {
  themeVariant: Variant;
  glitchLandingEnabled: boolean;
};

function HomePagePlannerContent({
  themeVariant,
  glitchLandingEnabled,
}: HomePagePlannerContentProps) {
  const plannerOverviewProps = useHomePlannerOverview();
  const { hydrated } = plannerOverviewProps;

  const [isSplashVisible, setSplashVisible] = React.useState(
    () => glitchLandingEnabled && !hydrated,
  );
  const [isSplashMounted, setSplashMounted] = React.useState(
    () => glitchLandingEnabled && !hydrated,
  );

  const beginHideSplash = React.useCallback(() => {
    setSplashVisible((prev) => {
      if (!prev) {
        return prev;
      }
      return false;
    });
  }, []);

  React.useEffect(() => {
    if (!glitchLandingEnabled) {
      setSplashVisible(false);
      setSplashMounted(false);
      return;
    }
    if (!hydrated) {
      setSplashMounted(true);
      setSplashVisible(true);
      return;
    }
    beginHideSplash();
  }, [beginHideSplash, glitchLandingEnabled, hydrated]);

  const handleClientReady = React.useCallback(() => {
    beginHideSplash();
  }, [beginHideSplash]);

  const handleSplashExit = React.useCallback(() => {
    setSplashMounted(false);
  }, []);

  return (
    <div className={styles.root}>
      {glitchLandingEnabled && isSplashMounted ? (
        <HomeSplash active={isSplashVisible} onExited={handleSplashExit} />
      ) : null}
      <section
        tabIndex={-1}
        className={styles.content}
        data-state={isSplashVisible ? "splash" : "ready"}
        aria-hidden={isSplashVisible ? true : undefined}
      >
        <HomePageBody
          themeVariant={themeVariant}
          plannerOverviewProps={plannerOverviewProps}
          onClientReady={glitchLandingEnabled ? handleClientReady : undefined}
          glitchLandingEnabled={glitchLandingEnabled}
        />
      </section>
    </div>
  );
}

type HomePageBodyProps = {
  themeVariant: Variant;
  plannerOverviewProps: PlannerOverviewProps;
  onClientReady?: () => void;
  glitchLandingEnabled: boolean;
};

function HomePageBody({
  themeVariant,
  plannerOverviewProps,
  onClientReady,
  glitchLandingEnabled,
}: HomePageBodyProps) {
  const { hydrated } = plannerOverviewProps;
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

  const hasAnnouncedReadyRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated) {
      hasAnnouncedReadyRef.current = false;
      return;
    }
    if (!onClientReady || hasAnnouncedReadyRef.current) {
      return;
    }
    onClientReady();
    hasAnnouncedReadyRef.current = true;
  }, [hydrated, onClientReady]);

  if (!glitchLandingEnabled) {
    return (
      <LegacyHomePageBody
        plannerOverviewProps={plannerOverviewProps}
        heroActions={heroActions}
        heroHeadingId={heroHeadingId}
        overviewHeadingId={overviewHeadingId}
      />
    );
  }

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

type LegacyHomePageBodyProps = {
  plannerOverviewProps: PlannerOverviewProps;
  heroActions: React.ReactNode;
  heroHeadingId: string;
  overviewHeadingId: string;
};

function LegacyHomePageBody({
  plannerOverviewProps,
  heroActions,
  heroHeadingId,
  overviewHeadingId,
}: LegacyHomePageBodyProps) {
  const {
    hydrating,
    summary,
    focus,
    goals,
    calendar,
  } = plannerOverviewProps;

  const activeGoals = goals.active;

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
          <SectionCard.Header
            id={heroHeadingId}
            title="Planner preview"
            titleAs="h1"
            titleClassName="text-balance text-title-lg font-semibold tracking-[-0.01em]"
            sticky={false}
          />
          <SectionCard.Body className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
            <div className="space-y-[var(--space-3)]">
              <p className="text-body text-muted-foreground">
                Planner highlights your next focus day, surfaces weekly goals, and gives the team a quick win tracker.
              </p>
              <p className="text-body text-muted-foreground">
                Use the controls below to switch themes or open the full planner experience.
              </p>
            </div>
            <div
              role="group"
              aria-label="Planner actions"
              className="flex flex-wrap items-center gap-[var(--space-3)]"
            >
              {heroActions}
            </div>
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
          <SectionCard.Body className="space-y-[var(--space-5)]" aria-busy={hydrating}
            aria-live={hydrating ? "polite" : undefined}
          >
            <div className="grid gap-[var(--space-3)] md:grid-cols-3" role="list">
              {summary.items.map((item) => (
                <article
                  key={item.key}
                  className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-3)]"
                  role="listitem"
                >
                  <p className="text-label text-muted-foreground">{item.label}</p>
                  <p className="text-ui font-semibold text-foreground text-balance">
                    {item.value}
                  </p>
                  <Link
                    href={item.href}
                    className="text-label font-medium text-primary transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.cta}
                  </Link>
                </article>
              ))}
            </div>
            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-focus-heading">
                <div className="flex items-center justify-between gap-[var(--space-2)]">
                  <h3 id="legacy-focus-heading" className="text-body font-semibold text-foreground">
                    {focus.label}
                  </h3>
                  <p className="text-label text-muted-foreground">
                    {hydrating ? "—" : `${focus.doneCount}/${focus.totalCount} done`}
                  </p>
                </div>
                <ul className="grid gap-[var(--space-2)]" role="list">
                  {focus.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 px-[var(--space-3)] py-[var(--space-2)]"
                    >
                      <span className="text-ui font-medium text-foreground">{task.title}</span>
                      {task.projectName ? (
                        <span className="text-label text-muted-foreground">{task.projectName}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {focus.remainingTasks > 0 ? (
                  <p className="text-label text-muted-foreground">
                    +{focus.remainingTasks} additional task{focus.remainingTasks === 1 ? "" : "s"} scheduled for the day
                  </p>
                ) : null}
              </section>
              <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-goals-heading">
                <div className="flex items-center justify-between gap-[var(--space-2)]">
                  <h3 id="legacy-goals-heading" className="text-body font-semibold text-foreground">
                    {goals.label ?? "Goals"}
                  </h3>
                  <p className="text-label text-muted-foreground">
                    {hydrating ? "—" : `${goals.completed}/${goals.total} complete`}
                  </p>
                </div>
                <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 p-[var(--space-3)]">
                  {activeGoals.length > 0 ? (
                    <ul className="grid gap-[var(--space-2)]" role="list">
                      {activeGoals.map((goal) => (
                        <li key={goal.id} className="flex flex-col gap-[var(--space-1)]">
                          <span className="text-ui font-medium text-foreground">{goal.title}</span>
                          {goal.detail ? (
                            <span className="text-label text-muted-foreground">{goal.detail}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-label text-muted-foreground">
                      {hydrating ? "Loading goals…" : goals.emptyMessage}
                    </p>
                  )}
                  <p className="text-label text-muted-foreground">
                    {hydrating
                      ? "Momentum updates after data loads."
                      : goals.total === goals.completed && goals.total > 0
                        ? goals.allCompleteMessage
                        : "Track progress without the glitch visuals."}
                  </p>
                </div>
              </section>
            </div>
            <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-calendar-heading">
              <div className="flex items-center justify-between gap-[var(--space-2)]">
                <h3 id="legacy-calendar-heading" className="text-body font-semibold text-foreground">
                  {calendar.label}
                </h3>
                <p className="text-label text-muted-foreground">{calendar.summary}</p>
              </div>
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {calendar.days.map((day) => (
                  <span
                    key={day.iso}
                    className="inline-flex min-w-[var(--space-8)] items-center justify-center rounded-full border border-border bg-card/60 px-[var(--space-2)] py-[var(--space-1)] text-label text-muted-foreground"
                    data-state={day.selected ? "selected" : undefined}
                    aria-current={day.selected ? "date" : undefined}
                  >
                    <span className="font-semibold text-foreground">{day.weekday}</span>
                    <span className="ml-[var(--space-1)] text-label text-muted-foreground">{day.dayNumber}</span>
                  </span>
                ))}
              </div>
            </section>
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  );
}
