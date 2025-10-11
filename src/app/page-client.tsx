"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useHomePlannerOverview } from "@/components/home";
import type { HeroPlannerHighlight, PlannerOverviewProps } from "@/components/home";
import { PageShell, Button, ThemeToggle, SectionCard, Skeleton } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme, useUiFeatureFlags } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";
import styles from "./page-client.module.css";

type HomeSplashProps = {
  active: boolean;
  onExited?: () => void;
};

const HomeSplash = dynamic<HomeSplashProps>(
  () => import("@/components/home/HomeSplash"),
  { ssr: false },
);

const HomeHeroSection = React.lazy(
  () => import("@/components/home/home-landing/HomeHeroSection"),
);

const HeroPlannerCards = React.lazy(
  () => import("@/components/home/HeroPlannerCards"),
);

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

function useGlitchLandingSplash(
  glitchLandingEnabled: boolean,
  hydrated: boolean,
) {
  const initialSplashState = glitchLandingEnabled && !hydrated;
  const [isSplashVisible, setSplashVisible] = React.useState(
    () => initialSplashState,
  );
  const [isSplashMounted, setSplashMounted] = React.useState(
    () => initialSplashState,
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

  return {
    isSplashVisible,
    isSplashMounted,
    handleClientReady,
    handleSplashExit,
  } as const;
}

function useHydratedCallback(hydrated: boolean, onReady?: () => void) {
  const hasAnnouncedReadyRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated) {
      hasAnnouncedReadyRef.current = false;
      return;
    }
    if (!onReady || hasAnnouncedReadyRef.current) {
      return;
    }
    onReady();
    hasAnnouncedReadyRef.current = true;
  }, [hydrated, onReady]);
}

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

  const {
    isSplashVisible,
    isSplashMounted,
    handleClientReady,
    handleSplashExit,
  } = useGlitchLandingSplash(glitchLandingEnabled, hydrated);

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
          variant="default"
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

  useHydratedCallback(hydrated, onClientReady);

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
            <React.Suspense
              fallback={
                <HomeHeroSectionFallback
                  headingId={heroHeadingId}
                  actions={heroActions}
                />
              }
            >
              <HomeHeroSection
                variant={themeVariant}
                actions={heroActions}
                headingId={heroHeadingId}
              />
            </React.Suspense>
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
            <React.Suspense fallback={<HeroPlannerCardsFallback />}>
              <HeroPlannerCards
                variant={themeVariant}
                plannerOverviewProps={plannerOverviewProps}
                highlights={weeklyHighlights}
              />
            </React.Suspense>
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  );
}

type HomeHeroSectionFallbackProps = {
  headingId: string;
  actions: React.ReactNode;
};

function HomeHeroSectionFallback({
  headingId,
  actions,
}: HomeHeroSectionFallbackProps) {
  return (
    <div className="grid gap-[var(--space-5)] md:grid-cols-12 md:items-center">
      <div className="flex flex-col gap-[var(--space-4)] md:col-span-6">
        <div className="flex items-center gap-[var(--space-2)]" aria-hidden="true">
          <Skeleton
            radius="full"
            className="h-[var(--space-6)] w-[var(--space-6)]"
          />
          <Skeleton className="h-[var(--space-4)] w-24" />
        </div>
        <div className="space-y-[var(--space-3)]">
          <h1
            id={headingId}
            className="text-balance text-title-lg font-semibold tracking-[-0.01em] text-foreground"
          >
            Welcome to Planner
          </h1>
          <span className="sr-only">Loading Planner hero content</span>
          <div className="space-y-[var(--space-2)]" aria-hidden="true">
            <Skeleton className="h-[var(--space-4)] w-5/6" />
            <Skeleton className="h-[var(--space-4)] w-2/3" />
          </div>
        </div>
        {actions ? (
          <div
            role="group"
            aria-label="Home hero actions"
            className="flex flex-wrap items-center gap-[var(--space-3)]"
          >
            {actions}
          </div>
        ) : null}
      </div>
      <div
        className="flex justify-center md:col-span-6 md:justify-end"
        aria-hidden="true"
      >
        <Skeleton
          radius="card"
          className="h-[calc(var(--space-8)*4.5)] w-full max-w-[calc(var(--space-8)*4)] md:max-w-[calc(var(--space-8)*4.5)] lg:max-w-[calc(var(--space-8)*5)]"
        />
      </div>
    </div>
  );
}

function HeroPlannerCardsFallback() {
  return (
    <div role="status" aria-live="polite" className="space-y-[var(--space-5)]">
      <span className="sr-only">Loading planner overview</span>
      <div className="grid gap-[var(--space-4)] md:grid-cols-12">
        <div className="md:col-span-6 space-y-[var(--space-3)]">
          <Skeleton radius="card" className="h-[calc(var(--space-8)*3)]" />
          <Skeleton className="h-[var(--space-4)] w-2/3" />
        </div>
        <div className="md:col-span-6 space-y-[var(--space-3)]">
          <Skeleton radius="card" className="h-[calc(var(--space-8)*3)]" />
          <Skeleton className="h-[var(--space-4)] w-1/2" />
        </div>
      </div>
      <div className="space-y-[var(--space-3)]">
        <Skeleton className="h-[var(--space-5)] w-1/3" />
        <div className="grid gap-[var(--space-3)] md:grid-cols-3">
          <Skeleton radius="card" className="h-[calc(var(--space-8)*2.5)]" />
          <Skeleton radius="card" className="h-[calc(var(--space-8)*2.5)]" />
          <Skeleton radius="card" className="h-[calc(var(--space-8)*2.5)]" />
        </div>
      </div>
      <div className="grid gap-[var(--space-4)] md:grid-cols-12">
        <Skeleton
          radius="card"
          className="md:col-span-4 h-[calc(var(--space-8)*3)]"
        />
        <Skeleton
          radius="card"
          className="md:col-span-4 h-[calc(var(--space-8)*3)]"
        />
        <Skeleton
          radius="card"
          className="md:col-span-4 h-[calc(var(--space-8)*3)]"
        />
        <Skeleton
          radius="card"
          className="md:col-span-6 h-[calc(var(--space-8)*3.5)]"
        />
        <Skeleton
          radius="card"
          className="md:col-span-6 h-[calc(var(--space-8)*3.5)]"
        />
      </div>
    </div>
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

const LegacyHomePageBody = React.memo(function LegacyHomePageBody({
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
});

LegacyHomePageBody.displayName = "LegacyHomePageBody";
