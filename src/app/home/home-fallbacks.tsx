import type { ReactNode } from "react";
import styles from "./HomePlannerIsland.module.css";

export const HOME_HERO_HEADING_ID = "home-hero-heading";
export const HOME_OVERVIEW_HEADING_ID = "home-overview-heading";

type HomeHeroSectionFallbackState = {
  headingId?: string;
  actions?: ReactNode;
  showActionPlaceholders?: boolean;
};

type HeroPlannerCardsFallbackState = {
  className?: string;
  summaryKeys?: readonly string[];
};

type HomePageSuspenseFallbackProps = {
  heroHeadingId?: string;
  overviewHeadingId?: string;
};

const DEFAULT_SUMMARY_KEYS = [
  "summary-placeholder-0",
  "summary-placeholder-1",
  "summary-placeholder-2",
] as const satisfies readonly string[];

export function HomeHeroSectionFallbackMarkup({
  headingId = "home-hero-fallback",
  actions,
  showActionPlaceholders = true,
}: HomeHeroSectionFallbackState) {
  const shouldRenderActions = Boolean(actions) || showActionPlaceholders;

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
      {shouldRenderActions ? (
        <div
          role="group"
          aria-label="Home hero actions"
          className="flex flex-wrap items-center gap-[var(--space-3)]"
        >
          {actions ?? (
            <>
              <div className="h-[var(--control-h-md)] w-32 animate-pulse rounded-full bg-muted/20" aria-hidden />
              <div className="h-[var(--control-h-md)] w-36 animate-pulse rounded-full bg-muted/30" aria-hidden />
            </>
          )}
        </div>
      ) : null}
      <span className="sr-only">Loading planner hero section…</span>
    </section>
  );
}

export function HeroPlannerCardsFallbackMarkup({
  className,
  summaryKeys,
}: HeroPlannerCardsFallbackState) {
  const keys = summaryKeys?.length ? summaryKeys : DEFAULT_SUMMARY_KEYS;
  const rootClassName = className
    ? `space-y-[var(--space-4)] ${className}`
    : "space-y-[var(--space-4)]";

  return (
    <section className={rootClassName} aria-busy>
      <div className="grid gap-[var(--space-3)] md:grid-cols-3">
        {keys.map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10"
            aria-hidden
          />
        ))}
      </div>
      <div className="grid gap-[var(--space-3)] md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
      </div>
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-border/60 bg-muted/10" aria-hidden />
      <span className="sr-only">Loading planner overview widgets…</span>
    </section>
  );
}

export function HomePageSuspenseFallback({
  heroHeadingId = HOME_HERO_HEADING_ID,
  overviewHeadingId = HOME_OVERVIEW_HEADING_ID,
}: HomePageSuspenseFallbackProps) {
  return (
    <div className={styles.root}>
      <section
        className={styles.content}
        data-state="ready"
        data-home-content=""
        aria-labelledby={heroHeadingId}
      >
        <header className="page-shell pt-[var(--space-6)] md:pt-[var(--space-8)]">
          <div className="[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)] md:grid-cols-12">
            <section
              aria-labelledby={heroHeadingId}
              className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft"
            >
              <div className="section-b text-ui md:p-[var(--space-6)]">
                <HomeHeroSectionFallbackMarkup
                  headingId={heroHeadingId}
                  showActionPlaceholders
                />
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
            <section
              aria-labelledby={overviewHeadingId}
              className="col-span-full rounded-card r-card-lg text-card-foreground shadow-depth-outer-strong card-neo-soft"
            >
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
                <HeroPlannerCardsFallbackMarkup />
              </div>
            </section>
          </div>
        </section>
      </section>
    </div>
  );
}

export type {
  HeroPlannerCardsFallbackState,
  HomeHeroSectionFallbackState,
};
