"use client"

import * as React from "react"
import type { CSSProperties } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import {
  useGlitchLandingSplash,
  useHomePlannerOverview,
  useHydratedCallback,
} from "@/components/home"
import { Card } from "@/components/home/Card"
import type {
  HeroPlannerCardsProps,
  HeroPlannerHighlight,
  PlannerOverviewProps,
} from "@/components/home"
import { PageShell, Button, SectionCard } from "@/components/ui"
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
import heroStyles from "./PlannerLandingHero.module.css"
import { Home as HomeIcon } from "lucide-react"

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
  'relative isolate overflow-hidden bg-[color-mix(in_oklab,hsl(var(--surface))_88%,hsl(var(--surface-2)))] shadow-inner-sm bg-glitch-noise-primary'
const homeBackdropNoiseStyle = {
  "--texture-grain-opacity": "var(--theme-noise-level-subtle, 0.03)",
  "--texture-grain-strength": "1",
} as CSSProperties
const sectionCardOverlayClassName = 'relative'

type PlannerLandingHeroProps = {
  actions: React.ReactNode
  heroHeadingId: string
}

function PlannerHeroIllustration() {
  return (
    <div className={heroStyles.illustrationWell} aria-hidden>
      <Image
        src="/images/planner-hero-illustration.svg"
        alt=""
        width={640}
        height={480}
        priority
      />
    </div>
  )
}

function PlannerLandingHero({ actions, heroHeadingId }: PlannerLandingHeroProps) {
  return (
    <div
      className={cn(
        "col-span-full md:col-span-12",
        "bg-panel-tilt-strong shadow-depth-soft shadow-inner-sm",
        heroStyles.card,
      )}
    >
      <div className={heroStyles.content}>
        <div className={heroStyles.copyColumn}>
          <div className="flex items-start gap-[var(--space-4)]">
            <span className={heroStyles.iconBadge}>
              <HomeIcon className="h-5 w-5" aria-hidden />
            </span>
            <div className={heroStyles.labelStack}>
              <span className={heroStyles.eyebrow}>Planner control hub</span>
              <h1 id={heroHeadingId} className={heroStyles.headline}>
                Plan your day, track goals, and review games
              </h1>
            </div>
          </div>
          <p className={heroStyles.body}>
            Build momentum with the same dashboard in both the glitch and legacy
            planners. Capture highlights, pin goals, and line up the next review
            in one place.
          </p>
          {actions ? (
            <div
              role="group"
              aria-label="Planner hero actions"
              className={heroStyles.actions}
            >
              {actions}
            </div>
          ) : null}
        </div>
        <div className={heroStyles.illustrationColumn}>
          <PlannerHeroIllustration />
        </div>
      </div>
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
  const heroActions = React.useMemo<React.ReactNode>(() => {
    const createGoalHref = `${withBasePath("/goals", { skipForNextLink: true })}?tab=goals&intent=create-goal#goal-form`
    const createReviewHref = `${withBasePath("/reviews", { skipForNextLink: true })}?intent=create-review`

    return (
      <>
        <Button
          asChild
          variant="default"
          size="md"
          tactile
          tone="primary"
          className="whitespace-nowrap shadow-depth-soft"
        >
          <Link href={createReviewHref}>New Review</Link>
        </Button>
        <Button
          asChild
          variant="default"
          size="md"
          tactile
          tone="accent"
          className="whitespace-nowrap shadow-depth-soft"
        >
          <Link href={createGoalHref}>New Goal</Link>
        </Button>
      </>
    )
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
        <PlannerLandingHero
          actions={heroActions}
          heroHeadingId={heroHeadingId}
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
          className={cn('col-span-full', sectionCardOverlayClassName)}
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
        <PlannerLandingHero
          actions={heroActions}
          heroHeadingId={heroHeadingId}
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
          className={cn('col-span-full', sectionCardOverlayClassName)}
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
                <Card
                  key={item.key}
                  as="article"
                  role="listitem"
                  className="h-full"
                >
                  <Card.Header
                    eyebrow={item.label}
                    title={item.value}
                    eyebrowClassName="text-label text-muted-foreground uppercase tracking-[0.08em]"
                    titleClassName="text-ui font-semibold text-foreground text-balance"
                  />
                  <Card.Actions className="mt-auto justify-start">
                    <Button asChild size="sm" variant="quiet">
                      <Link href={withBasePath(item.href, { skipForNextLink: true })}>
                        {item.cta}
                      </Link>
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
              <Card
                as="section"
                aria-labelledby="legacy-focus-heading"
                className="h-full"
              >
                <Card.Header
                  id="legacy-focus-heading"
                  title={focus.label}
                  titleClassName="text-body font-semibold text-foreground"
                  actions={
                    <p className="text-label text-muted-foreground">
                      {hydrating ? "—" : `${focus.doneCount}/${focus.totalCount} done`}
                    </p>
                  }
                />
                <Card.Body className="text-card-foreground">
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
                </Card.Body>
                {focus.remainingTasks > 0 ? (
                  <Card.Footer className="text-label text-muted-foreground">
                    +{focus.remainingTasks} additional task{focus.remainingTasks === 1 ? "" : "s"} scheduled for the day
                  </Card.Footer>
                ) : null}
              </Card>
              <Card
                as="section"
                aria-labelledby="legacy-goals-heading"
                className="h-full"
              >
                <Card.Header
                  id="legacy-goals-heading"
                  title={goals.label ?? "Goals"}
                  titleClassName="text-body font-semibold text-foreground"
                  actions={
                    <p className="text-label text-muted-foreground">
                      {hydrating ? "—" : `${goals.completed}/${goals.total} complete`}
                    </p>
                  }
                />
                <Card.Body className="text-card-foreground">
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
                </Card.Body>
                <Card.Footer className="text-label text-muted-foreground">
                  {hydrating
                    ? "Momentum updates after data loads."
                    : goals.total === goals.completed && goals.total > 0
                      ? goals.allCompleteMessage
                      : "Track progress without the glitch visuals."}
                </Card.Footer>
              </Card>
            </div>
            <Card
              as="section"
              aria-labelledby="legacy-calendar-heading"
              className="h-full"
            >
              <Card.Header
                id="legacy-calendar-heading"
                title={calendar.label}
                titleClassName="text-body font-semibold text-foreground"
                description={calendar.summary}
                descriptionClassName="text-label text-muted-foreground"
              />
              <Card.Body className="text-card-foreground">
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
              </Card.Body>
            </Card>
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </>
  )
})

LegacyLandingLayout.displayName = "LegacyLandingLayout"
