import * as React from 'react'

export type HomeHeroSectionFallbackContentProps = {
  headingId: string
  actions?: React.ReactNode
}

export function HomeHeroSectionFallbackContent({
  headingId,
  actions,
}: HomeHeroSectionFallbackContentProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-border/80 bg-surface p-[var(--space-5)]"
    >
      <div className="space-y-[var(--space-3)]">
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted/40" aria-hidden />
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/30" aria-hidden />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/20" aria-hidden />
      </div>
      <div className="space-y-[var(--space-2)]">
        <div className="h-20 w-full animate-pulse rounded-xl bg-muted/10" aria-hidden />
        <div className="h-20 w-full animate-pulse rounded-xl bg-muted/10" aria-hidden />
      </div>
      {actions ? (
        <div
          role="group"
          aria-label="Home hero actions"
          className="flex w-full flex-col gap-[var(--space-3)] sm:w-auto sm:flex-row sm:items-center"
        >
          {actions}
        </div>
      ) : null}
      <span className="sr-only">Loading planner hero section…</span>
    </section>
  )
}

const DEFAULT_SUMMARY_KEYS = [
  'summary-placeholder-0',
  'summary-placeholder-1',
  'summary-placeholder-2',
] as const

export type HeroPlannerCardsFallbackContentProps = {
  className?: string
  summaryKeys?: readonly string[]
}

export function HeroPlannerCardsFallbackContent({
  className,
  summaryKeys,
}: HeroPlannerCardsFallbackContentProps) {
  const keys = summaryKeys && summaryKeys.length > 0 ? summaryKeys : DEFAULT_SUMMARY_KEYS
  const rootClassName = className
    ? `space-y-[var(--space-4)] ${className}`
    : 'space-y-[var(--space-4)]'

  return (
    <section className={rootClassName} aria-busy>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 md:grid-cols-3">
        {keys.map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10"
            aria-hidden
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
      </div>
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
      <span className="sr-only">Loading planner overview widgets…</span>
    </section>
  )
}
