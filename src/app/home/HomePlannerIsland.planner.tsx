"use client"

import * as React from "react"
import type { CSSProperties } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  useGlitchLandingSplash,
  useHomePlannerOverview,
  useHydratedCallback,
  PlannerOverview,
  WelcomeHeroFigure,
} from "@/components/home"
import type {
  HeroPlannerCardsProps,
  HeroPlannerHighlight,
  PlannerOverviewProps,
} from "@/components/home"
import { Hero, PageShell, SectionCard } from "@/components/ui"
import type { HeroAction } from "@/components/ui"
import { PlannerProvider } from "@/components/planner"
import { useTheme } from "@/lib/theme-context"
import { useThemeQuerySync } from "@/lib/theme-hooks"
import type { Variant } from "@/lib/theme"
import { cn, withBasePath } from "@/lib/utils"
import {
  HeroPlannerCardsFallbackContent,
  type HeroPlannerCardsFallbackContentProps,
} from "./fallback-content"
import styles from "../page-client.module.css"
import heroContentStyles from "./GlitchLandingHeroContent.module.css"
import { Home as HomeIcon } from "lucide-react"
import ProgressRingIcon from "@/icons/ProgressRingIcon"

type HomeSplashProps = {
  active: boolean
  onExited?: () => void
}

const HomeSplash = dynamic<HomeSplashProps>(
  () => import("@/components/home/HomeSplash").then((mod) => mod.HomeSplash),
  { ssr: false },
)

const HeroPlannerCards = dynamic(
  () =>
    import("@/components/home/HeroPlannerCards").then((mod) => mod.HeroPlannerCards),
  {
    loading: () => <HeroPlannerCardsFallback />,
  },
) as React.ComponentType<HeroPlannerCardsProps>

const HeroPlannerCardsFallbackContext =
  React.createContext<HeroPlannerCardsFallbackContentProps | null>(null)

export type HomePlannerIslandPlannerProps = {
  heroHeadingId: string
  overviewHeadingId: string
  glitchLandingEnabled: boolean
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

const homeBackdropClassName =
  'relative isolate overflow-hidden bg-[color-mix(in_oklab,hsl(var(--surface))_88%,hsl(var(--surface-2)))] bg-[var(--texture-scanlines)] shadow-[var(--shadow-outer-xl)]'
const homeBackdropNoiseStyle = {
  "--texture-grain-opacity": "var(--theme-noise-level-subtle, 0.03)",
  "--texture-grain-strength": "1",
  backgroundImage: "var(--texture-scanlines)",
} as CSSProperties

const glitchHeroMetrics = [
  {
    id: "next-pulse",
    label: "Next pulse",
    value: "Retro sync · 3:00 PM",
    hint: "Confidence steady at medium.",
  },
  {
    id: "ambient-streak",
    label: "Ambient streak",
    value: "4 days",
    hint: "Signals hold — keep logging highlights.",
  },
] as const

function GlitchLandingHeroMetrics() {
  return (
    <div className={cn(heroContentStyles.heroBody, heroContentStyles.copyColumn)}>
      <div className={heroContentStyles.metricGrid}>
        {glitchHeroMetrics.map((metric) => (
          <div key={metric.id} className={heroContentStyles.metricCard}>
            <p className={heroContentStyles.metricLabel}>{metric.label}</p>
            <p className={heroContentStyles.metricValue}>{metric.value}</p>
            <p className={heroContentStyles.metricHint}>{metric.hint}</p>
          </div>
        ))}
      </div>
      <div className={heroContentStyles.focusCard}>
        <div className={heroContentStyles.focusRing}>
          <ProgressRingIcon pct={68} size="l" />
          <span className={heroContentStyles.focusValue}>68%</span>
        </div>
        <p className={heroContentStyles.focusLabel}>Focus locked</p>
        <p className={heroContentStyles.focusHint}>
          Flow stabilized for the current sprint window.
        </p>
      </div>
    </div>
  )
}

type GlitchLandingHeroFigureProps = {
  themeVariant: Variant
}

function GlitchLandingHeroFigure({
  themeVariant,
}: GlitchLandingHeroFigureProps) {
  return (
    <div className={heroContentStyles.figureWell}>
      <WelcomeHeroFigure
        variant={themeVariant}
        haloTone="subtle"
        showGlitchRail={false}
      />
    </div>
  )
}

function HomePageContent({
  heroHeadingId,
  overviewHeadingId,
  glitchLandingEnabled,
}: HomePlannerIslandPlannerProps) {
  const [theme] = useTheme()
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
    <div
      className={cn(styles.root, homeBackdropClassName)}
      style={homeBackdropNoiseStyle}
    >
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
  const heroActions = React.useMemo<ReadonlyArray<HeroAction>>(() => {
    const createGoalHref = `${withBasePath("/goals", { skipForNextLink: true })}?tab=goals&intent=create-goal#goal-form`
    const createReviewHref = `${withBasePath("/reviews", { skipForNextLink: true })}?intent=create-review`

    return [
      {
        id: "new-review",
        asChild: true,
        variant: "default",
        size: "md",
        tactile: true,
        tone: "primary",
        className: "whitespace-nowrap shadow-depth-soft",
        label: <Link href={createReviewHref}>New Review</Link>,
      },
      {
        id: "new-goal",
        asChild: true,
        variant: "default",
        size: "md",
        tactile: true,
        tone: "accent",
        className: "whitespace-nowrap shadow-depth-soft",
        label: <Link href={createGoalHref}>New Goal</Link>,
      },
    ] satisfies ReadonlyArray<HeroAction>
  }, [])

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
  heroActions: ReadonlyArray<HeroAction>
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
        <Hero
          variant="panel"
          className={cn(
            "col-span-full md:col-span-12",
            heroContentStyles.heroCard,
          )}
          headingId={heroHeadingId}
          title={
            <span className="inline-flex items-center gap-[var(--space-2)]">
              <HomeIcon className="h-5 w-5" aria-hidden />
              <span>Planner Control Hub</span>
            </span>
          }
          subtitle="Track your goals, activities, and drafts."
          actions={heroActions}
          actionsLabel="Home hero actions"
          hero={<GlitchLandingHeroFigure themeVariant={themeVariant} />}
          heroClassName={heroContentStyles.figureColumn}
        >
          <GlitchLandingHeroMetrics />
        </Hero>
      </PageShell>
      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
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
  glitchLandingEnabled,
}: HomePlannerIslandPlannerProps) {
  return (
    <HomePageContent
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
      glitchLandingEnabled={glitchLandingEnabled}
    />
  )
}

type LegacyHomePageBodyProps = {
  plannerOverviewProps: PlannerOverviewProps
  heroActions: ReadonlyArray<HeroAction>
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
  heroActions: ReadonlyArray<HeroAction>
  heroHeadingId: string
  overviewHeadingId: string
}

const LegacyLandingLayout = React.memo(function LegacyLandingLayout({
  plannerOverviewProps,
  heroActions,
  heroHeadingId,
  overviewHeadingId,
}: LegacyLandingLayoutProps) {
  const { hydrating } = plannerOverviewProps

  return (
    <>
      <PageShell
        as="header"
        grid
        aria-labelledby={heroHeadingId}
        className="pt-[var(--space-6)] md:pt-[var(--space-8)]"
      >
        <Hero
          variant="panel"
          className="col-span-full md:col-span-12"
          headingId={heroHeadingId}
          title={
            <span className="inline-flex items-center gap-[var(--space-2)]">
              <HomeIcon className="h-5 w-5" aria-hidden />
              <span>Planner Control Hub</span>
            </span>
          }
          subtitle={
            <>
              <span className="block">Track your goals, activities, and drafts.</span>
              <span className="mt-[var(--space-2)] block text-body text-muted-foreground">
                Create goals, kick off reviews, or jump into the planner without the
                glitch visuals.
              </span>
            </>
          }
          actions={heroActions}
          actionsLabel="Home hero actions"
        />
      </PageShell>
      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
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
            className="md:p-[var(--space-6)]"
            aria-busy={hydrating}
            aria-live={hydrating ? "polite" : undefined}
          >
            <PlannerOverview {...plannerOverviewProps} />
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  )
})

LegacyLandingLayout.displayName = "LegacyLandingLayout"
