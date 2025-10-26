"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Button, PageShell, SectionCard, ThemeToggle } from "@/components/ui"
import { cn, withBasePath } from "@/lib/utils"
import {
  HeroPlannerCardsFallbackContent,
  HomeHeroSectionFallbackContent,
} from "./fallback-content"
import styles from "../page-client.module.css"
import type { HomePlannerIslandPlannerProps } from "./HomePlannerIsland.planner"

const homeBackdropClassName =
  'relative isolate overflow-hidden bg-[radial-gradient(140%_120%_at_50%_-8%,hsl(var(--surface)/0.16),transparent_72%)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[linear-gradient(180deg,hsl(var(--background)/0.9),hsl(var(--background)/0.7))] after:opacity-100 after:content-[""]'
const sectionCardOverlayClassName =
  'relative overflow-hidden border border-card-hairline/40 bg-[linear-gradient(180deg,hsl(var(--card)/0.78),hsl(var(--card)/0.6))] backdrop-blur-xl shadow-depth-soft'

let latestPlannerProps: HomePlannerIslandPlannerProps | null = null

function getFallbackProps(): HomePlannerIslandPlannerProps {
  return (
    latestPlannerProps ?? {
      heroHeadingId: "home-hero-fallback",
      overviewHeadingId: "home-overview-fallback",
      glitchLandingEnabled: true,
    }
  )
}

function HomePlannerIslandFallback() {
  const { heroHeadingId, overviewHeadingId, glitchLandingEnabled } =
    getFallbackProps()
  const dataState = glitchLandingEnabled ? "splash" : "ready"
  const heroActions = (
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
  )

  return (
    <div className={cn(styles.root, homeBackdropClassName)}>
      <section
        tabIndex={-1}
        className={styles.content}
        data-state={dataState}
        data-home-content=""
      >
        <PageShell
          as="header"
          grid
          aria-labelledby={heroHeadingId}
          className="pt-[var(--space-6)] md:pt-[var(--space-8)]"
        >
          <SectionCard
            aria-labelledby={heroHeadingId}
            className={cn('col-span-full', sectionCardOverlayClassName)}
          >
            <SectionCard.Body className="md:p-[var(--space-6)]">
              <HomeHeroSectionFallbackContent
                headingId={heroHeadingId}
                actions={heroActions}
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
              <HeroPlannerCardsFallbackContent />
            </SectionCard.Body>
          </SectionCard>
        </PageShell>
      </section>
    </div>
  )
}

const HomePlannerIslandPlanner = dynamic<HomePlannerIslandPlannerProps>(
  () => import("./HomePlannerIsland.planner"),
  {
    ssr: false,
    loading: HomePlannerIslandFallback,
  },
)

export interface HomePlannerIslandClientProps
  extends Omit<HomePlannerIslandPlannerProps, "glitchLandingEnabled"> {
  glitchLandingEnabled?: boolean
}

export default function HomePlannerIslandClient(
  { glitchLandingEnabled: _glitchLandingEnabled, ...plannerProps }: HomePlannerIslandClientProps,
) {
  const nextPlannerProps: HomePlannerIslandPlannerProps = {
    ...plannerProps,
    glitchLandingEnabled:
      _glitchLandingEnabled ??
      latestPlannerProps?.glitchLandingEnabled ??
      true,
  }

  latestPlannerProps = nextPlannerProps
  return <HomePlannerIslandPlanner {...nextPlannerProps} />
}
