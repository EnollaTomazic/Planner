"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useGlitchLandingSplash,
  useHomePlannerOverview,
  useHydratedCallback,
} from "@/components/home";
import type {
  HeroPlannerCardsProps,
  HeroPlannerHighlight,
  PlannerOverviewProps,
} from "@/components/home";
import type { HomeHeroSectionProps } from "@/components/home/home-landing/types";
import { Button, ThemeToggle } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Variant } from "@/lib/theme";
import styles from "./HomePlannerIsland.module.css";
import {
  type HeroPlannerCardsFallbackState,
  type HomeHeroSectionFallbackState,
  HomeHeroSectionFallbackMarkup,
  HeroPlannerCardsFallbackMarkup,
  HOME_HERO_HEADING_ID,
  HOME_OVERVIEW_HEADING_ID,
} from "./home-fallbacks";

const HomeSplash = dynamic(
  () => import("@/components/home/HomeSplash"),
  { ssr: false },
);

const HomeHeroSection = dynamic(
  () => import("@/components/home/home-landing/HomeHeroSection"),
  {
    loading: () => <HomeHeroSectionFallback />,
  },
) as React.ComponentType<HomeHeroSectionProps>;

const HeroPlannerCards = dynamic(
  () => import("@/components/home/HeroPlannerCards"),
  {
    loading: () => <HeroPlannerCardsFallback />,
  },
) as React.ComponentType<HeroPlannerCardsProps>;

const HeroSectionFallbackContext =
  React.createContext<HomeHeroSectionFallbackState | null>(null);

const HeroPlannerCardsFallbackContext =
  React.createContext<HeroPlannerCardsFallbackState | null>(null);

type HomeSplashProps = {
  active: boolean;
  onExited?: () => void;
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

type HomePlannerIslandProps = {
  glitchLandingEnabled: boolean;
};

export default function HomePlannerIsland({
  glitchLandingEnabled,
}: HomePlannerIslandProps) {
  const [theme] = useTheme();
  const plannerOverviewProps = useHomePlannerOverview();
  const { hydrated } = plannerOverviewProps;
  const contentRef = React.useRef<HTMLElement>(null);

  useThemeQuerySync();

  const {
    isSplashVisible,
    isSplashMounted,
    handleClientReady,
    handleSplashExit,
  } = useGlitchLandingSplash(glitchLandingEnabled, hydrated);

  React.useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    setElementInert(content, isSplashVisible);

    if (isSplashVisible && document.activeElement === content) {
      (document.activeElement as HTMLElement).blur();
    }

    return () => {
      if (!content.isConnected) {
        return;
      }

      setElementInert(content, false);
    };
  }, [isSplashVisible]);

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

  const heroFallbackValue = React.useMemo<HomeHeroSectionFallbackState>(
    () => ({
      headingId: HOME_HERO_HEADING_ID,
      actions: heroActions,
      showActionPlaceholders: false,
    }),
    [heroActions],
  );

  const cardsFallbackValue = React.useMemo<HeroPlannerCardsFallbackState>(
    () => ({
      summaryKeys: plannerOverviewProps.summary.items.map((item) => item.key),
    }),
    [plannerOverviewProps.summary.items],
  );

  return (
    <PlannerProvider>
      <HomePagePlannerContent
        contentRef={contentRef}
        glitchLandingEnabled={glitchLandingEnabled}
        heroActions={heroActions}
        plannerOverviewProps={plannerOverviewProps}
        themeVariant={theme.variant}
        isSplashMounted={isSplashMounted}
        isSplashVisible={isSplashVisible}
        onSplashExit={handleSplashExit}
        heroFallbackValue={heroFallbackValue}
        cardsFallbackValue={cardsFallbackValue}
        onClientReady={glitchLandingEnabled ? handleClientReady : undefined}
      />
    </PlannerProvider>
  );
}

type HomePagePlannerContentProps = {
  contentRef: React.MutableRefObject<HTMLElement | null>;
  glitchLandingEnabled: boolean;
  plannerOverviewProps: PlannerOverviewProps;
  themeVariant: Variant;
  isSplashMounted: boolean;
  isSplashVisible: boolean;
  onSplashExit: HomeSplashProps["onExited"];
  onClientReady?: () => void;
  heroActions: React.ReactNode;
  heroFallbackValue: HomeHeroSectionFallbackState;
  cardsFallbackValue: HeroPlannerCardsFallbackState;
};

function HomePagePlannerContent({
  contentRef,
  glitchLandingEnabled,
  plannerOverviewProps,
  themeVariant,
  isSplashMounted,
  isSplashVisible,
  onSplashExit,
  onClientReady,
  heroActions,
  heroFallbackValue,
  cardsFallbackValue,
}: HomePagePlannerContentProps) {
  return (
    <div className={styles.root}>
      {glitchLandingEnabled && isSplashMounted ? (
        <HomeSplash active={isSplashVisible} onExited={onSplashExit} />
      ) : null}
      <section
        ref={contentRef}
        tabIndex={-1}
        className={styles.content}
        data-state={isSplashVisible ? "splash" : "ready"}
        aria-hidden={isSplashVisible ? true : undefined}
        data-inert={isSplashVisible ? "" : undefined}
        data-home-content=""
      >
        <HomePageBody
          glitchLandingEnabled={glitchLandingEnabled}
          plannerOverviewProps={plannerOverviewProps}
          themeVariant={themeVariant}
          heroActions={heroActions}
          heroFallbackValue={heroFallbackValue}
          cardsFallbackValue={cardsFallbackValue}
          onClientReady={onClientReady}
        />
      </section>
    </div>
  );
}

type HomePageBodyProps = {
  glitchLandingEnabled: boolean;
  plannerOverviewProps: PlannerOverviewProps;
  themeVariant: Variant;
  heroActions: React.ReactNode;
  heroFallbackValue: HomeHeroSectionFallbackState;
  cardsFallbackValue: HeroPlannerCardsFallbackState;
  onClientReady?: () => void;
};

function HomePageBody({
  glitchLandingEnabled,
  plannerOverviewProps,
  themeVariant,
  heroActions,
  heroFallbackValue,
  cardsFallbackValue,
  onClientReady,
}: HomePageBodyProps) {
  const { hydrated } = plannerOverviewProps;
  const heroHeadingId = HOME_HERO_HEADING_ID;
  const overviewHeadingId = HOME_OVERVIEW_HEADING_ID;

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
      <header
        className="page-shell pt-[var(--space-6)] md:pt-[var(--space-8)]"
        aria-labelledby={heroHeadingId}
      >
        <div className="[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12">
          <HeroSectionFallbackContext.Provider value={heroFallbackValue}>
            <section className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft" aria-labelledby={heroHeadingId}>
              <div className="section-b text-ui md:p-[var(--space-6)]">
                <HomeHeroSection
                  variant={themeVariant}
                  actions={heroActions}
                  headingId={heroHeadingId}
                />
              </div>
            </section>
          </HeroSectionFallbackContext.Provider>
        </div>
      </header>
      <section
        className="page-shell mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
        role="region"
        aria-labelledby={overviewHeadingId}
      >
        <div className="[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12">
          <HeroPlannerCardsFallbackContext.Provider value={cardsFallbackValue}>
            <section className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft" aria-labelledby={overviewHeadingId}>
              <div className="section-h">
                <div className="flex w-full items-center justify-between">
                  <div>
                    <h2
                      id={overviewHeadingId}
                      className="text-title font-semibold tracking-[-0.01em]"
                    >
                      Planner overview
                    </h2>
                  </div>
                </div>
              </div>
              <div className="section-b text-ui md:p-[var(--space-6)]">
                <HeroPlannerCards
                  variant={themeVariant}
                  plannerOverviewProps={plannerOverviewProps}
                  highlights={weeklyHighlights}
                />
              </div>
            </section>
          </HeroPlannerCardsFallbackContext.Provider>
        </div>
      </section>
    </>
  );
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
      <header
        className="page-shell pt-[var(--space-6)] md:pt-[var(--space-8)]"
        aria-labelledby={heroHeadingId}
      >
        <div className="[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12">
          <section className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft" aria-labelledby={heroHeadingId}>
            <div className="section-h">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h1
                    id={heroHeadingId}
                    className="text-balance text-title-lg font-semibold tracking-[-0.01em]"
                  >
                    Planner preview
                  </h1>
                </div>
                <div
                  role="group"
                  aria-label="Planner actions"
                  className="flex flex-wrap items-center gap-[var(--space-3)]"
                >
                  {heroActions}
                </div>
              </div>
            </div>
            <div className="section-b text-ui">
              <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
                <div className="space-y-[var(--space-3)]">
                  <p className="text-body text-muted-foreground">
                    Planner highlights your next focus day, surfaces weekly goals, and gives the team a quick win tracker.
                  </p>
                  <p className="text-body text-muted-foreground">
                    Use the controls below to switch themes or open the full planner experience.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </header>
      <section
        className="page-shell mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
        role="region"
        aria-labelledby={overviewHeadingId}
      >
        <div className="[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12">
          <section className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft" aria-labelledby={overviewHeadingId}>
            <div className="section-h">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2
                    id={overviewHeadingId}
                    className="text-title font-semibold tracking-[-0.01em]"
                  >
                    Planner overview
                  </h2>
                </div>
              </div>
            </div>
            <div
              className="section-b space-y-[var(--space-5)] text-ui"
              aria-busy={hydrating}
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
            </div>
          </section>
        </div>
      </section>
    </>
  );
});

LegacyHomePageBody.displayName = "LegacyHomePageBody";

function HomeHeroSectionFallback() {
  const fallbackProps = React.useContext(HeroSectionFallbackContext);

  return (
    <HomeHeroSectionFallbackMarkup
      headingId={fallbackProps?.headingId}
      actions={fallbackProps?.actions}
      showActionPlaceholders={fallbackProps?.showActionPlaceholders}
    />
  );
}

function HeroPlannerCardsFallback() {
  const fallbackProps = React.useContext(HeroPlannerCardsFallbackContext);

  return (
    <HeroPlannerCardsFallbackMarkup
      className={fallbackProps?.className}
      summaryKeys={fallbackProps?.summaryKeys}
    />
  );
}

type InertableElement = HTMLElement & { inert: boolean };

function isInertable(element: Element): element is InertableElement {
  return "inert" in element;
}

function setElementInert(element: Element, inert: boolean) {
  if (isInertable(element)) {
    element.inert = inert;
    return;
  }

  if (inert) {
    element.setAttribute("inert", "");
  } else {
    element.removeAttribute("inert");
  }
}

export type { HomePlannerIslandProps };
