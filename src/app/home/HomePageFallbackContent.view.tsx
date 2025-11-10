'use client'

import type { CSSProperties, ReactNode } from 'react'

import { PageShell, Skeleton } from '@/app/_loading'
import { cn } from '@/lib/utils'
import styles from '../page-client.module.css'

const sectionCardOverlayClassName = 'relative'
const sectionCardClassName = cn(
  'shadow-depth-outer-strong rounded-card r-card-lg text-card-foreground card-neo-soft col-span-full',
  sectionCardOverlayClassName,
)
const homeBackdropClassName =
  'relative isolate overflow-hidden bg-[color-mix(in_oklab,hsl(var(--surface))_88%,hsl(var(--surface-2)))] shadow-inner-sm bg-glitch-noise-primary'
const homeBackdropNoiseStyle = {
  "--texture-grain-opacity": 'var(--theme-noise-level-subtle, 0.03)',
  "--texture-grain-strength": '1',
} as CSSProperties

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
    <div
      className={cn(styles.root, homeBackdropClassName)}
      style={homeBackdropNoiseStyle}
    >
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
      <PageShell
        as="header"
        grid
        className="pt-[var(--space-6)] md:pt-[var(--space-8)]"
        aria-labelledby={heroHeadingId}
      >
        <section className={sectionCardClassName} aria-labelledby={heroHeadingId}>
          <div className="section-b text-ui md:p-[var(--space-6)]">
            <HomeHeroSectionFallbackContent
              headingId={heroHeadingId}
              actions={<HeroActionSkeletons />}
            />
          </div>
        </section>
      </PageShell>
      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        grid
        className="mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
        aria-labelledby={overviewHeadingId}
      >
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
      </PageShell>
    </>
  )
}

function HeroActionSkeletons() {
  return (
    <Skeleton
      radius="full"
      className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)]"
    />
  )
}

function LegacyHomeFallback({
  heroHeadingId,
  overviewHeadingId,
}: LandingFallbackProps) {
  return (
    <>
      <PageShell
        as="header"
        grid
        className="pt-[var(--space-6)] md:pt-[var(--space-8)]"
        aria-labelledby={heroHeadingId}
      >
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
                <Skeleton
                  className="w-[min(100%,calc(var(--space-8)*4))]"
                  radius="md"
                />
                <Skeleton
                  className="h-[calc(var(--space-4)+var(--spacing-1))] w-[min(100%,calc(var(--space-8)*4.5))]"
                  radius="md"
                />
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
      </PageShell>
      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        grid
        className="mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
        aria-labelledby={overviewHeadingId}
      >
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
                    <Skeleton
                      className="w-[min(100%,calc(var(--space-8)*1.75))]"
                      radius="md"
                    />
                    <Skeleton
                      className="h-[var(--space-5)] w-[min(100%,calc(var(--space-8)*2))]"
                      radius="md"
                    />
                    <Skeleton
                      className="w-[min(100%,calc(var(--space-8)*1.5))]"
                      radius="md"
                    />
                  </article>
                ))}
              </div>
              <div className="grid gap-[var(--space-4)] md:grid-cols-2">
                <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-focus-heading">
                  <div className="flex items-center justify-between gap-[var(--space-2)]">
                    <Skeleton
                      className="h-[calc(var(--space-4)+var(--spacing-1))] w-[min(100%,calc(var(--space-8)*1.75))]"
                      radius="md"
                    />
                    <Skeleton
                      className="w-[min(100%,calc(var(--space-8)*1.25))]"
                      radius="md"
                    />
                  </div>
                  <ul className="grid gap-[var(--space-2)]" role="list">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={`legacy-focus-${index}`}
                        className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 px-[var(--space-3)] py-[var(--space-2)]"
                      >
                        <Skeleton
                          className="w-[min(100%,calc(var(--space-8)*2.5))]"
                          radius="md"
                        />
                        <Skeleton
                          className="h-[var(--spacing-3)] w-[min(100%,calc(var(--space-8)*2))]"
                          radius="md"
                        />
                      </li>
                    ))}
                  </ul>
                  <Skeleton
                    className="h-[var(--spacing-3)] w-[min(100%,calc(var(--space-8)*3))]"
                    radius="md"
                  />
                </section>
                <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-goals-heading">
                  <div className="flex items-center justify-between gap-[var(--space-2)]">
                    <Skeleton
                      className="h-[calc(var(--space-4)+var(--spacing-1))] w-[min(100%,calc(var(--space-8)*1.5))]"
                      radius="md"
                    />
                    <Skeleton
                      className="w-[min(100%,calc(var(--space-8)*1.25))]"
                      radius="md"
                    />
                  </div>
                  <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-border/80 bg-card/70 p-[var(--space-3)]">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={`legacy-goal-${index}`} className="space-y-[var(--space-1)]">
                        <Skeleton
                          className="w-[min(100%,calc(var(--space-8)*2.5))]"
                          radius="md"
                        />
                        <Skeleton
                          className="h-[var(--spacing-3)] w-[min(100%,calc(var(--space-8)*2))]"
                          radius="md"
                        />
                      </div>
                    ))}
                    <Skeleton
                      className="h-[var(--spacing-3)] w-[min(100%,calc(var(--space-8)*3.5))]"
                      radius="md"
                    />
                  </div>
                </section>
              </div>
              <section className="space-y-[var(--space-3)]" aria-labelledby="legacy-calendar-heading">
                <div className="flex items-center justify-between gap-[var(--space-2)]">
                  <Skeleton
                    className="h-[calc(var(--space-4)+var(--spacing-1))] w-[min(100%,calc(var(--space-8)*1.75))]"
                    radius="md"
                  />
                  <Skeleton
                    className="w-[min(100%,calc(var(--space-8)*1.5))]"
                    radius="md"
                  />
                </div>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={`legacy-day-${index}`}
                      className="inline-flex min-w-[var(--space-8)] items-center justify-center rounded-full border border-border bg-card/60 px-[var(--space-2)] py-[var(--space-1)]"
                    >
                      <span
                        className="skeleton block h-[var(--space-4)] w-[var(--space-5)] rounded-[var(--radius-md)]"
                        aria-hidden
                      />
                    </span>
                  ))}
                </div>
              </section>
          </div>
        </section>
      </PageShell>
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
          <Skeleton
            className="w-[min(100%,calc(var(--space-8)*1.75))]"
            radius="md"
          />
          <Skeleton
            className="h-[var(--space-5)] w-[min(100%,calc(var(--space-8)*2))]"
            radius="md"
          />
          <Skeleton
            className="w-[min(100%,calc(var(--space-8)*1.5))]"
            radius="md"
          />
        </article>
      ))}
    </div>
  )
}
