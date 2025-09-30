import * as React from "react";

import {
  BlobContainer,
  DripDivider,
  GlitchButton,
  ProgressRing,
} from "@/components/ui";
import { glitchLandingPreviewEnabled } from "@/lib/features";
import { cn } from "@/lib/utils";

import styles from "./glitch-landing.module.css";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#support", label: "Support" },
];

const METRICS = [
  {
    value: 82,
    tone: "accent" as const,
    label: "Daily clarity",
    copy: "Teams hit 82% task completion once focus lanes sync.",
  },
  {
    value: 64,
    tone: "info" as const,
    label: "Focus score",
    copy: "Momentum index blends scrims, VOD blocks, and reviews.",
  },
];

const FEATURE_CARDS = [
  {
    title: "Adaptive backlog",
    body:
      "Token-driven swimlanes auto-adjust to scrim cadence and sync windows so squads can rebalance without losing intent.",
  },
  {
    title: "Rhythm analytics",
    body:
      "Glitch telemetry pipes weekly reviews into focus heuristics, alerting coaches when practice intensity drifts.",
  },
  {
    title: "Cross-lane alerts",
    body:
      "Depth-aware notifications respect warmups, scrims, and cooldowns so planners never fracture a hard-earned flow state.",
  },
];

const FOOTER_LINKS = [
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
  { href: "#support", label: "Support" },
];

function FeatureFlagFallback() {
  return (
    <div className={cn(styles.page, "items-center justify-center")}> 
      <div className="page-shell flex flex-1 items-center justify-center py-[var(--space-8)]">
        <div className="max-w-xl space-y-[var(--space-3)] text-center">
          <h2 className="text-title font-semibold tracking-[-0.01em]">
            Glitch landing preview disabled
          </h2>
          <p className="text-label text-muted-foreground">
            Enable <code>NEXT_PUBLIC_FEATURE_GLITCH_LANDING</code> to render the
            full experience in preview builds.
          </p>
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <header className="page-shell py-[var(--space-5)]">
      <nav
        className="flex flex-wrap items-center justify-between gap-[var(--space-4)]"
        aria-label="Primary navigation"
      >
        <div className="flex items-center gap-[var(--space-3)]">
          <span className="flex h-[var(--space-6)] w-[var(--space-6)] items-center justify-center rounded-[var(--radius-lg)] bg-primary/20 text-label font-semibold text-primary">
            LG
          </span>
          <span className="text-ui font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Planner glitch
          </span>
        </div>
        <ul className="hidden flex-1 items-center justify-center gap-[var(--space-4)] text-label text-muted-foreground lg:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <a
                className="rounded-[var(--radius-sm)] px-[var(--space-2)] py-[var(--space-1)] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-[var(--space-2)]">
          <GlitchButton size="sm" tone="accent">
            Get access
          </GlitchButton>
          <GlitchButton size="sm" tone="info">
            Log in
          </GlitchButton>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className={cn(styles.hero, "page-shell pb-[var(--space-8)] pt-[var(--space-6)]")}> 
      <div className={styles.heroBacker} aria-hidden>
        <span className={cn(styles.heroBlob, styles.heroBlobPrimary)}>
          <BlobContainer overlayToken="glitch-overlay-opacity-card" />
        </span>
        <span className={cn(styles.heroBlob, styles.heroBlobSecondary)}>
          <BlobContainer overlayToken="glitch-overlay-button-opacity" />
        </span>
      </div>
      <div
        className={cn(
          styles.heroFrame,
          "grid gap-[var(--space-6)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center",
        )}
      >
        <div className="space-y-[var(--space-6)]">
          <div className="space-y-[var(--space-3)]">
            <p className="text-caption font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Planner OS
            </p>
            <h1 className="text-display-sm font-semibold tracking-[-0.03em] text-balance">
              Orchestrate every lane of your climb with glitch precision
            </h1>
            <p className="text-ui text-muted-foreground">
              Sequence scrims, reviews, and rest windows using the same tokens
              that power the live Planner. Adaptive surfaces honour
              <abbr title="prefers-reduced-motion" className="no-underline">
                motion
              </abbr>
              , depth, and theme contrasts across every variant.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <GlitchButton size="lg">Start free trial</GlitchButton>
            <GlitchButton size="lg" tone="info">
              View changelog
            </GlitchButton>
          </div>
          <DripDivider tone="accent" />
          <div className={styles.metrics}>
            {METRICS.map((metric) => (
              <article
                key={metric.label}
                className="flex flex-col gap-[var(--space-2)] rounded-card border border-card-hairline/50 bg-card/75 p-[var(--space-4)] shadow-[var(--shadow-neo)]"
              >
                <ProgressRing value={metric.value} tone={metric.tone}>
                  {metric.label}
                </ProgressRing>
                <p className="text-label text-muted-foreground">{metric.copy}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="relative flex min-h-[calc(var(--space-8)*10)] items-stretch">
          <div className="relative z-[1] flex w-full flex-col justify-between gap-[var(--space-4)] rounded-card border border-card-hairline/60 bg-card/80 p-[var(--space-6)] shadow-[var(--shadow-neo-soft)]">
            <div className="space-y-[var(--space-3)]">
              <p className="text-caption font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Today · Split push focus
              </p>
              <ul className="space-y-[var(--space-2)] text-label text-muted-foreground">
                <li className="flex items-start gap-[var(--space-2)]">
                  <span className="mt-[var(--spacing-0-25)] h-[var(--space-2)] w-[var(--space-2)] rounded-full bg-accent" aria-hidden />
                  <span>
                    <strong className="text-ui text-foreground">Scrim blocks</strong>
                    <br />
                    Sync reviews after the second block to lock jungle vision setups.
                  </span>
                </li>
                <li className="flex items-start gap-[var(--space-2)]">
                  <span className="mt-[var(--spacing-0-25)] h-[var(--space-2)] w-[var(--space-2)] rounded-full bg-primary" aria-hidden />
                  <span>
                    <strong className="text-ui text-foreground">Macro review</strong>
                    <br />
                    Queue VOD playlist with mid priority filters and preloaded timestamps.
                  </span>
                </li>
                <li className="flex items-start gap-[var(--space-2)]">
                  <span className="mt-[var(--spacing-0-25)] h-[var(--space-2)] w-[var(--space-2)] rounded-full bg-accent-2" aria-hidden />
                  <span>
                    <strong className="text-ui text-foreground">Team reset</strong>
                    <br />
                    Depth theme softens contrast, locking UI into recovery mode during cooldown.
                  </span>
                </li>
              </ul>
            </div>
            <DripDivider tone="surface" />
            <div className="flex items-center justify-between text-label text-muted-foreground">
              <span>Next sync</span>
              <span className="font-semibold text-foreground">18:30 scrim lobby</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FeatureCards() {
  return (
    <section id="features" className="page-shell space-y-[var(--space-5)] py-[var(--space-8)]">
      <div className="space-y-[var(--space-2)]">
        <h2 className="text-title font-semibold tracking-[-0.015em]">
          Built on depth and glitch tokens
        </h2>
        <p className="text-ui text-muted-foreground">
          The landing modules reuse the production control stack so tone, motion,
          and contrast stay accessible across Glitch, Aurora, Kitten, Oceanic,
          Citrus, Noir, and Hardstuck themes.
        </p>
      </div>
      <div className={styles.featureGrid}>
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className="flex flex-col gap-[var(--space-3)] rounded-card border border-card-hairline/45 bg-card/70 p-[var(--space-5)] shadow-[var(--shadow-neo)] transition-[transform,box-shadow] duration-quick ease-out motion-reduce:transition-none hover:-translate-y-[var(--spacing-0-5)] hover:shadow-[var(--shadow-neo-strong)]"
          >
            <h3 className="text-ui font-semibold text-foreground">{card.title}</h3>
            <p className="text-label text-muted-foreground">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="support"
      className="page-shell border-t border-card-hairline/40 py-[var(--space-6)]"
    >
      <div className="flex flex-col gap-[var(--space-3)] text-label text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Planner Glitch. Tokens licensed for squad use.</p>
        <nav aria-label="Footer">
          <ul className={styles.footerLinks}>
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  className="rounded-[var(--radius-sm)] px-[var(--space-2)] py-[var(--space-1)] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default function GlitchLandingPage() {
  if (!glitchLandingPreviewEnabled) {
    return <FeatureFlagFallback />;
  }

  return (
    <div className={styles.page}>
      <Navigation />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeatureCards />
      </main>
      <Footer />
    </div>
  );
}
