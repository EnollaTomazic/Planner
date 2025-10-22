"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  useGlitchLandingSplash,
  useHomePlannerOverview,
  useHydratedCallback,
} from "@/components/home"
import type {
  HeroPlannerCardsProps,
  HeroPlannerHighlight,
  PlannerOverviewProps,
} from "@/components/home"
import type { HomeHeroSectionProps } from "@/components/home/home-landing/types"
import { PageShell, Button, ThemeToggle, SectionCard } from "@/components/ui"
import { PlannerProvider } from "@/components/planner"
import { useTheme, useUiFeatureFlags } from "@/lib/theme-context"
import { useThemeQuerySync } from "@/lib/theme-hooks"
import type { Variant } from "@/lib/theme"
import { withBasePath } from "@/lib/utils"
import {
  HeroPlannerCardsFallbackContent,
  HomeHeroSectionFallbackContent,
  type HeroPlannerCardsFallbackContentProps,
  type HomeHeroSectionFallbackContentProps,
} from "./fallback-content"
import styles from "../page-client.module.css"

type HomeSplashProps = {
  active: boolean
  onExited?: () => void
}

const HomeSplash = dynamic<HomeSplashProps>(
  () => import("@/components/home/HomeSplash").then((mod) => mod.HomeSplash),
  { ssr: false },
)

const HomeHeroSection = dynamic(
  () =>
    import("@/components/home/home-landing/HomeHeroSection").then(
      (mod) => mod.HomeHeroSection,
    ),
  {
    loading: () => <HomeHeroSectionFallback />,
  },
) as React.ComponentType<HomeHeroSectionProps>

const HeroPlannerCards = dynamic(
  () =>
    import("@/components/home/HeroPlannerCards").then((mod) => mod.HeroPlannerCards),
  {
    loading: () => <HeroPlannerCardsFallback />,
  },
) as React.ComponentType<HeroPlannerCardsProps>

const HeroSectionFallbackContext =
  React.createContext<HomeHeroSectionFallbackContentProps | null>(null)

const HeroPlannerCardsFallbackContext =
  React.createContext<HeroPlannerCardsFallbackContentProps | null>(null)

export type HomePlannerIslandPlannerProps = {
  heroHeadingId: string
  overviewHeadingId: string
}

function HomeHeroSectionFallback() {
  const fallbackProps = React.useContext(HeroSectionFallbackContext)
  const headingId = fallbackProps?.headingId ?? "home-hero-fallback"

  return (
    <HomeHeroSectionFallbackContent
      headingId={headingId}
      actions={fallbackProps?.actions}
    />
  )
}

function HeroPlannerCardsFallback() {
  const fallbackProps = React.useContext(HeroPlannerCardsFallbackContext)

  return (
    <HeroPlannerCardsFallbackContent
      className={fallbackProps?.className}
      summaryKeys={fallbackProps?.summaryKeys}
    />
  )
}

type InertableElement = HTMLElement & { inert: boolean }

function isInertable(element: Element): element is InertableElement {
  return "inert" in element
}

function setElementInert(element: Element, inert: boolean) {
  if (isInertable(element)) {
    element.inert = inert
    return
  }

  if (inert) {
    element.setAttribute("inert", "")
  } else {
    element.removeAttribute("inert")
  }
}

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
] as const satisfies readonly HeroPlannerHighlight[]

function HomePageContent({
  heroHeadingId,
  overviewHeadingId,
}: HomePlannerIslandPlannerProps) {
  const [theme] = useTheme()
  const { glitchLandingEnabled } = useUiFeatureFlags()
  useThemeQuerySync()

  return (
    <PlannerProvider>
      <HomePagePlannerContent
        themeVariant={theme.variant}
        glitchLandingEnabled={glitchLandingEnabled}
        heroHeadingId={heroHeadingId}
        overviewHeadingId={overviewHeadingId}
      />
    </PlannerProvider>
  )
}

type HomePagePlannerContentProps = {
  themeVariant: Variant
  glitchLandingEnabled: boolean
  heroHeadingId: string
  overviewHeadingId: string
}

function HomePagePlannerContent({
  themeVariant,
  glitchLandingEnabled,
  heroHeadingId,
  overviewHeadingId,
}: HomePagePlannerContentProps) {
  const plannerOverviewProps = useHomePlannerOverview()
  const { hydrated } = plannerOverviewProps
  const contentRef = React.useRef<HTMLElement>(null)

  const {
    isSplashVisible,
    isSplashMounted,
    handleClientReady,
    handleSplashExit,
  } = useGlitchLandingSplash(glitchLandingEnabled, hydrated)

  React.useEffect(() => {
    const content = contentRef.current

    if (!content) {
      return
    }

    setElementInert(content, isSplashVisible)

    if (isSplashVisible && document.activeElement === content) {
      ;(document.activeElement as HTMLElement).blur()
    }

    return () => {
      if (!content.isConnected) {
        return
      }

      setElementInert(content, false)
    }
  }, [isSplashVisible])

  return (
    <div className={styles.root}>
      {glitchLandingEnabled && isSplashMounted ? (
        <HomeSplash active={isSplashVisible} onExited={handleSplashExit} />
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
          themeVariant={themeVariant}
          plannerOverviewProps={plannerOverviewProps}
          onClientReady={glitchLandingEnabled ? handleClientReady : undefined}
          glitchLandingEnabled={glitchLandingEnabled}
          heroHeadingId={heroHeadingId}
          overviewHeadingId={overviewHeadingId}
        />
      </section>
    </div>
  )
}

type HomePageBodyProps = {
  themeVariant: Variant
  plannerOverviewProps: PlannerOverviewProps
  onClientReady?: () => void
  glitchLandingEnabled: boolean
  heroHeadingId: string
  overviewHeadingId: string
}

function HomePageBody({
  themeVariant,
  plannerOverviewProps,
  onClientReady,
  glitchLandingEnabled,
  heroHeadingId,
  overviewHeadingId,
}: HomePageBodyProps) {
  const { hydrated } = plannerOverviewProps
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
          <Link href={withBasePath("/planner", { skipForNextLink: true })}>Plan Week</Link>
        </Button>
      </>
    ),
    [],
  )

  useHydratedCallback(hydrated, onClientReady)

  if (!glitchLandingEnabled) {
    return (
      <LegacyHomePageBody
        plannerOverviewProps={plannerOverviewProps}
        heroActions={heroActions}
        heroHeadingId={heroHeadingId}
        overviewHeadingId={overviewHeadingId}
      />
    )
  }

  return (
    <GlitchLandingLayout
      heroActions={heroActions}
      plannerOverviewProps={plannerOverviewProps}
      themeVariant={themeVariant}
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
}

type GlitchLandingLayoutProps = {
  heroActions: React.ReactNode
  plannerOverviewProps: PlannerOverviewProps
  themeVariant: Variant
  heroHeadingId: string
  overviewHeadingId: string
}

const GlitchLandingLayout = React.memo(function GlitchLandingLayout({
  heroActions,
  plannerOverviewProps,
  themeVariant,
  heroHeadingId,
  overviewHeadingId,
}: GlitchLandingLayoutProps) {
  const summaryKeys = plannerOverviewProps.summary.items.map((item) => item.key)

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
            <HeroSectionFallbackContext.Provider
              value={{
                actions: heroActions,
                headingId: heroHeadingId,
              }}
            >
              <HomeHeroSection
                variant={themeVariant}
                actions={heroActions}
                headingId={heroHeadingId}
              />
            </HeroSectionFallbackContext.Provider>
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
            <HeroPlannerCardsFallbackContext.Provider
              value={{ summaryKeys }}
            >
              <HeroPlannerCards
                variant={themeVariant}
                plannerOverviewProps={plannerOverviewProps}
                highlights={weeklyHighlights}
              />
            </HeroPlannerCardsFallbackContext.Provider>
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  )
})

GlitchLandingLayout.displayName = "GlitchLandingLayout"

export default function HomePlannerIslandPlanner({
  heroHeadingId,
  overviewHeadingId,
}: HomePlannerIslandPlannerProps) {
  return (
    <HomePageContent
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
}

type LegacyHomePageBodyProps = {
  plannerOverviewProps: PlannerOverviewProps
  heroActions: React.ReactNode
  heroHeadingId: string
  overviewHeadingId: string
}

const LegacyHomePageBody = React.memo(function LegacyHomePageBody({
  plannerOverviewProps,
  heroActions,
  heroHeadingId,
  overviewHeadingId,
}: LegacyHomePageBodyProps) {
  return (
    <LegacyLandingLayout
      plannerOverviewProps={plannerOverviewProps}
      heroActions={heroActions}
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
})

LegacyHomePageBody.displayName = "LegacyHomePageBody"

type LegacyLandingLayoutProps = {
  plannerOverviewProps: PlannerOverviewProps
  heroActions: React.ReactNode
  heroHeadingId: string
  overviewHeadingId: string
}

const LegacyLandingLayout = React.memo(function LegacyLandingLayout({
  plannerOverviewProps,
  heroActions,
  heroHeadingId,
  overviewHeadingId,
}: LegacyLandingLayoutProps) {
  const { hydrating, summary, focus, goals, calendar } = plannerOverviewProps
  const activeGoals = goals.active

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
              className="flex w-full flex-col gap-[var(--space-3)] sm:w-auto sm:flex-row sm:items-center sm:justify-end"
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
          <SectionCard.Body
            className="space-y-[var(--space-5)]"
            aria-busy={hydrating}
            aria-live={hydrating ? "polite" : undefined}
          >
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 md:grid-cols-3" role="list">
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
                    href={withBasePath(item.href, { skipForNextLink: true })}
                    className="text-label font-medium text-primary transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.cta}
                  </Link>
                </article>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
              <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-focus-heading">
                <div className="flex w-full flex-col items-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex w-full flex-col items-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
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
              <div className="flex w-full flex-col items-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
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
  )
})

LegacyLandingLayout.displayName = "LegacyLandingLayout"
