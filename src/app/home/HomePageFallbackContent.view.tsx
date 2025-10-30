'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import styles from '../page-client.module.css'

const layoutGridClassName =
  '[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12'
const sectionCardOverlayClassName = 'relative'
const sectionCardClassName = cn(
  'shadow-depth-outer-strong rounded-card r-card-lg text-card-foreground card-neo-soft col-span-full',
  sectionCardOverlayClassName,
)
const homeBackdropClassName =
  'relative isolate bg-[color-mix(in_oklab,hsl(var(--surface))_88%,hsl(var(--surface-2)))]'

export type HomePageFallbackProps = {
  heroHeadingId: string
  overviewHeadingId: string
}

export type HomePageFallbackContentProps = HomePageFallbackProps & {
  glitchLandingEnabled: boolean
}

export function HomePageFallbackContentView({
  glitchLandingEnabled,
  heroHeadingId,
  overviewHeadingId,
}: HomePageFallbackContentProps) {
  return (
    <div className={cn(styles.root, homeBackdropClassName)}>
      <section
        tabIndex={-1}
        className={styles.content}
        data-state={glitchLandingEnabled ? 'splash' : 'ready'}
        data-home-content=""
      >
        {glitchLandingEnabled ? (
          <GlitchLandingFallback
            heroHeadingId={heroHeadingId}
            overviewHeadingId={overviewHeadingId}
          />
        ) : (
          <LegacyHomeFallback
            heroHeadingId={heroHeadingId}
            overviewHeadingId={overviewHeadingId}
          />
        )}
      </section>
    </div>
  )
}

type LandingFallbackProps = {
  heroHeadingId: string
  overviewHeadingId: string
}

function GlitchLandingFallback({
  heroHeadingId,
  overviewHeadingId,
}: LandingFallbackProps) {
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-label="Planner is loading"
        className="sr-only"
      >
        Planner is loading
      </div>
      <div className={`page-shell pt-[var(--space-6)] md:pt-[var(--space-8)]`} aria-labelledby={heroHeadingId}>
        <div className={layoutGridClassName}>
          <section className={sectionCardClassName} aria-labelledby={heroHeadingId}>
            <div className="section-b text-ui md:p-[var(--space-6)]">
              <HomeHeroSectionFallbackContent
                headingId={heroHeadingId}
                actions={<HeroActionSkeletons />}
              />
            </div>
          </section>
        </div>
      </div>
      <div
        className={`page-shell mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]`}
      >
        <div className={layoutGridClassName}>
          <section className={sectionCardClassName} aria-labelledby={overviewHeadingId}>
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
              className="section-b text-ui md:p-[var(--space-6)]"
              aria-labelledby={overviewHeadingId}
            >
              <HeroPlannerCardsFallbackContent />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function HeroActionSkeletons() {
  return (
    <div
      className="h-10 w-32 animate-pulse rounded-full bg-primary/20"
      aria-hidden
    />
  )
}

function LegacyHomeFallback({
  heroHeadingId,
  overviewHeadingId,
}: LandingFallbackProps) {
  return (
    <>
      <div className={`page-shell pt-[var(--space-6)] md:pt-[var(--space-8)]`} aria-labelledby={heroHeadingId}>
        <div className={layoutGridClassName}>
          <section className={sectionCardClassName} aria-labelledby={heroHeadingId}>
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
              </div>
            </div>
            <div
              className="section-b text-ui"
              aria-labelledby={heroHeadingId}
            >
              <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
                <div className="space-y-[var(--space-3)]">
                  <div className="h-4 w-64 animate-pulse rounded-md bg-muted/30" aria-hidden />
                  <div className="h-4 w-72 animate-pulse rounded-md bg-muted/20" aria-hidden />
                </div>
                <div
                  role="group"
                  aria-label="Planner actions"
                  className="flex flex-wrap items-center gap-[var(--space-3)]"
                >
                  <HeroActionSkeletons />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div
        className={`page-shell mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]`}
      >
        <div className={layoutGridClassName}>
          <section className={sectionCardClassName} aria-labelledby={overviewHeadingId}>
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
              aria-busy
              aria-live="polite"
              aria-labelledby={overviewHeadingId}
            >
              <div className="grid gap-[var(--space-3)] md:grid-cols-3" role="list">
                {Array.from({ length: 3 }).map((_, index) => (
                  <article
                    key={`legacy-summary-${index}`}
                    className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-3)]"
                    role="listitem"
                  >
                    <div className="h-4 w-28 animate-pulse rounded-md bg-muted/30" aria-hidden />
                    <div className="h-6 w-32 animate-pulse rounded-md bg-muted/20" aria-hidden />
                    <div className="h-4 w-24 animate-pulse rounded-md bg-muted/10" aria-hidden />
                  </article>
                ))}
              </div>
              <div className="grid gap-[var(--space-4)] md:grid-cols-2">
                <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-focus-heading">
                  <div className="flex items-center justify-between gap-[var(--space-2)]">
                    <div className="h-5 w-28 animate-pulse rounded-md bg-muted/30" aria-hidden />
                    <div className="h-4 w-20 animate-pulse rounded-md bg-muted/20" aria-hidden />
                  </div>
                  <ul className="grid gap-[var(--space-2)]" role="list">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={`legacy-focus-${index}`}
                        className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 px-[var(--space-3)] py-[var(--space-2)]"
                      >
                        <div className="h-4 w-40 animate-pulse rounded-md bg-muted/20" aria-hidden />
                        <div className="h-3 w-32 animate-pulse rounded-md bg-muted/10" aria-hidden />
                      </li>
                    ))}
                  </ul>
                  <div className="h-3 w-48 animate-pulse rounded-md bg-muted/10" aria-hidden />
                </section>
                <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-goals-heading">
                  <div className="flex items-center justify-between gap-[var(--space-2)]">
                    <div className="h-5 w-24 animate-pulse rounded-md bg-muted/30" aria-hidden />
                    <div className="h-4 w-20 animate-pulse rounded-md bg-muted/20" aria-hidden />
                  </div>
                  <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 p-[var(--space-3)]">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={`legacy-goal-${index}`} className="space-y-[var(--space-1)]">
                        <div className="h-4 w-40 animate-pulse rounded-md bg-muted/20" aria-hidden />
                        <div className="h-3 w-32 animate-pulse rounded-md bg-muted/10" aria-hidden />
                      </div>
                    ))}
                    <div className="h-3 w-56 animate-pulse rounded-md bg-muted/10" aria-hidden />
                  </div>
                </section>
              </div>
              <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-calendar-heading">
                <div className="flex items-center justify-between gap-[var(--space-2)]">
                  <div className="h-5 w-28 animate-pulse rounded-md bg-muted/30" aria-hidden />
                  <div className="h-4 w-24 animate-pulse rounded-md bg-muted/20" aria-hidden />
                </div>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={`legacy-day-${index}`}
                      className="inline-flex min-w-[var(--space-8)] items-center justify-center rounded-full border border-border bg-card/60 px-[var(--space-2)] py-[var(--space-1)]"
                    >
                      <span className="h-4 w-6 animate-pulse rounded-md bg-muted/20" aria-hidden />
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function HomeHeroSectionFallbackContent({
  headingId,
  actions,
}: {
  headingId: string
  actions: ReactNode
}) {
  return (
    <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
      <div className="space-y-[var(--space-4)]">
        <h1
          id={headingId}
          className="text-balance text-title-lg font-semibold tracking-[-0.01em]"
        >
          Planner preview
        </h1>
        <p className="max-w-[50ch] text-pretty text-ui text-muted-foreground">
          Stay organized with daily rituals, focused goals, and progress updates that keep the whole team aligned.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-[var(--space-3)]" aria-hidden>
        {actions}
      </div>
    </div>
  )
}

function HeroPlannerCardsFallbackContent() {
  return (
    <div className="grid gap-[var(--space-3)] md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={`hero-planner-card-${index}`}
          className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-border bg-card/70 p-[var(--space-3)]"
        >
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted/30" aria-hidden />
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted/20" aria-hidden />
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted/10" aria-hidden />
        </article>
      ))}
    </div>
  )
}
