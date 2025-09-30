"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarCheck, Sparkles, Timer, Trophy } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { SectionCard } from "@/components/ui";
import BlobContainer from "@/components/ui/primitives/BlobContainer";
import DripDivider from "@/components/ui/primitives/DripDivider";
import GlitchButton from "@/components/ui/primitives/GlitchButton";
import ProgressRing from "@/components/ui/primitives/ProgressRing";
import { useUiFeatureFlags } from "@/lib/theme-context";

import styles from "./glitch-landing.module.css";

type FeatureCard = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  footer: string;
};

type TimelineEntry = {
  id: string;
  label: string;
  detail: string;
};

const featureCards: readonly FeatureCard[] = [
  {
    id: "coordination",
    eyebrow: "Scrim readiness",
    title: "Shared prep canvas",
    summary:
      "Assign lanes, lock champions, and broadcast counter picks with zero overlap.",
    footer: "Roster sync stays accessible in Noir and Hardstuck via token clamping.",
  },
  {
    id: "reviews",
    eyebrow: "Post-match",
    title: "Highlight reel",
    summary:
      "Collect timeline calls, itemization notes, and VOD timestamps directly from teammates.",
    footer: "Review queue badges respect reduced motion while keeping ≥4.5:1 contrast.",
  },
  {
    id: "automation",
    eyebrow: "Automation",
    title: "Adaptive scheduling",
    summary:
      "Auto-place reviews when scrims shift; blockers surface before day start.",
    footer: "Scheduler blend modes map to theme tokens for Aurora, Oceanic, and Kitten.",
  },
] as const;

const timeline: readonly TimelineEntry[] = [
  {
    id: "briefing",
    label: "09:00 · Strategy briefing",
    detail: "Distribute draft positions and confirm priority bands.",
  },
  {
    id: "scrim",
    label: "12:30 · Scrim block",
    detail: "Three-game set with instant feedback prompts.",
  },
  {
    id: "review",
    label: "18:00 · Review window",
    detail: "Capture highlights and assign focus drills before reset.",
  },
] as const;

function GlitchLandingFeatureGuard({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { glitchLandingEnabled } = useUiFeatureFlags();

  if (!glitchLandingEnabled) {
    return (
      <SectionCard
        aria-live="polite"
        className="border-dashed text-center text-muted-foreground"
      >
        <SectionCard.Body className="space-y-[var(--space-3)]">
          <p className="text-label font-medium uppercase tracking-[0.06em]">
            Feature flag disabled
          </p>
          <p className="text-body">
            Enable <code>ui-glitch-landing</code> to load the Lavender Glitch landing
            layout preview.
          </p>
        </SectionCard.Body>
      </SectionCard>
    );
  }

  return <>{children}</>;
}

function GlitchLandingPreview() {
  const heroHeadingId = "glitch-landing-hero";

  return (
    <article aria-labelledby={heroHeadingId} className={styles.root}>
      <header className={styles.header}>
        <div className="flex items-center gap-[var(--space-2)] text-muted-foreground">
          <Sparkles aria-hidden="true" className="size-[var(--space-5)]" />
          <p className="text-label font-semibold uppercase tracking-[0.08em]">
            Lavender Glitch
          </p>
        </div>
        <nav aria-label="Primary" className={styles.navLinks}>
          <Link className="text-label text-muted-foreground" href="#overview">
            Overview
          </Link>
          <Link className="text-label text-muted-foreground" href="#planner">
            Planner
          </Link>
          <Link className="text-label text-muted-foreground" href="#reviews">
            Reviews
          </Link>
        </nav>
        <GlitchButton size="sm" tone="accent" variant="primary" asChild>
          <Link href="#join">Join beta</Link>
        </GlitchButton>
      </header>

      <section className={styles.hero} aria-labelledby={heroHeadingId} id="overview">
        <div className={styles.heroCopy}>
          <div className="space-y-[var(--space-2)]">
            <p className="text-label font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Coaching OS
            </p>
            <h1
              id={heroHeadingId}
              className="text-balance text-title-xl font-semibold tracking-[-0.02em] text-foreground"
            >
              Victory planning, reimagined
            </h1>
          </div>
          <p className="text-body text-muted-foreground">
            Align scrims, reviews, and roster health with glitch-grade clarity. Every
            component reuses shared tokens, so Glitch, Aurora, Kitten, Oceanic,
            Citrus, Noir, and Hardstuck stay perfectly in sync.
          </p>
          <div
            className={styles.heroActions}
            role="group"
            aria-label="Primary actions"
          >
            <GlitchButton tone="accent" size="md" variant="primary" asChild>
              <Link href="#planner">Plan next scrim</Link>
            </GlitchButton>
            <GlitchButton
              variant="secondary"
              tone="info"
              size="md"
              glitchIntensity="glitch-overlay-opacity-card"
              asChild
            >
              <Link href="#reviews">See review queue</Link>
            </GlitchButton>
          </div>
        </div>
        <div className={styles.heroGraphic} aria-labelledby="glitch-landing-snapshot">
          <BlobContainer
            aria-hidden
            className="opacity-100"
            overlayToken="glitch-overlay-opacity-card"
            noiseActiveToken="glitch-static-opacity"
          />
          <div
            className="absolute inset-0 grid grid-rows-[auto_1fr_auto] gap-[var(--space-3)] p-[var(--space-4)]"
          >
            <p
              id="glitch-landing-snapshot"
              className="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground"
            >
              Snapshot
            </p>
            <div className="grid gap-[var(--space-3)]">
              <div className="rounded-card border border-card-hairline-60 bg-surface/80 p-[var(--space-3)] shadow-[var(--shadow-outline-faint)]">
                <p className="text-label font-medium text-foreground">Scrim draft</p>
                <p className="text-caption text-muted-foreground">
                  Lanes locked · Counter bans synced
                </p>
              </div>
              <div className="rounded-card border border-card-hairline-60 bg-surface/80 p-[var(--space-3)] shadow-[var(--shadow-outline-faint)]">
                <p className="text-label font-medium text-foreground">Review queue</p>
                <p className="text-caption text-muted-foreground">
                  5 highlights pending · 2 flagged items
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-card border border-card-hairline bg-panel/80 px-[var(--space-3)] py-[var(--space-2)] text-caption text-muted-foreground">
              <span className="font-medium text-foreground">Roster pulse</span>
              <span aria-live="polite">All lanes green</span>
            </div>
          </div>
          <div className={styles.heroMetric} aria-live="polite">
            <ProgressRing
              value={72}
              size="m"
              tone="accent"
              label="Weekly readiness"
            />
            <span className="text-label font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              Weekly readiness
            </span>
            <span className="text-title font-semibold text-foreground">72%</span>
          </div>
        </div>
      </section>

      <DripDivider tone="surface" className="w-full" />

      <section
        aria-labelledby="glitch-landing-features"
        className={styles.cards}
        id="planner"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="glitch-landing-features"
            className="text-title font-semibold tracking-[-0.01em] text-foreground"
          >
            Planner building blocks
          </h2>
          <span className="text-label text-muted-foreground">
            Zero CLS · token-aligned
          </span>
        </div>
        {featureCards.map((card) => (
          <SectionCard key={card.id} className="border border-card-hairline-60">
            <SectionCard.Body className={styles.cardBody}>
              <div className="space-y-[var(--space-2)]">
                <p className="text-label font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {card.eyebrow}
                </p>
                <h3 className="text-title font-semibold text-foreground">{card.title}</h3>
                <p className="text-body text-muted-foreground">{card.summary}</p>
              </div>
              <p className={`text-caption ${styles.cardFooter}`}>{card.footer}</p>
            </SectionCard.Body>
          </SectionCard>
        ))}
      </section>

      <section
        aria-labelledby="glitch-landing-timeline"
        className={styles.rail}
        id="reviews"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="glitch-landing-timeline"
            className="text-title font-semibold tracking-[-0.01em] text-foreground"
          >
            Day-of execution
          </h2>
          <span className="text-label text-muted-foreground">Predictable, token-safe</span>
        </div>
        <div className="grid gap-[var(--space-3)] rounded-card border border-card-hairline bg-panel/70 p-[var(--space-4)] shadow-[var(--shadow-outline-subtle)]">
          {timeline.map((item) => (
            <div key={item.id} className={styles.timelineItem}>
              <span className={styles.timelineMarker}>
                <Timer aria-hidden="true" className="size-[var(--space-4)]" />
              </span>
              <div className="space-y-[var(--space-1)]">
                <p className="text-label font-medium text-foreground">{item.label}</p>
                <p className="text-caption text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-3)] rounded-card border border-card-hairline bg-surface/80 p-[var(--space-4)] shadow-[var(--shadow-outline-subtle)]">
          <CalendarCheck aria-hidden="true" className="size-[var(--space-5)] text-accent" />
          <div className="flex-1 space-y-[var(--space-1)]">
            <p className="text-label font-medium text-foreground">Auto-sync with agenda</p>
            <p className="text-caption text-muted-foreground">
              Agenda updates stream in without shifting layout thanks to reserved grid tracks.
            </p>
          </div>
          <GlitchButton tone="primary" size="sm" variant="ghost" href="#agenda">
            View agenda
          </GlitchButton>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="flex items-center gap-[var(--space-2)] text-muted-foreground">
          <Trophy aria-hidden="true" className="size-[var(--space-5)]" />
          <span className="text-label font-semibold uppercase tracking-[0.08em]">
            Built for victory laps
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-3)] text-label text-muted-foreground">
          <Link href="#privacy">Privacy</Link>
          <Link href="#status">Status</Link>
          <Link href="#support">Support</Link>
        </div>
      </footer>
    </article>
  );
}

export default defineGallerySection({
  id: "homepage",
  entries: [
    {
      id: "glitch-landing",
      name: "Lavender Glitch landing",
      description:
        "Feature-flagged landing layout showcasing Lavender Glitch navigation, hero, planner cards, and timeline rail.",
      kind: "complex",
      tags: ["landing", "homepage", "glitch"],
      preview: createGalleryPreview({
        id: "pages:glitch-landing:overview",
        render: () => (
          <GlitchLandingFeatureGuard>
            <GlitchLandingPreview />
          </GlitchLandingFeatureGuard>
        ),
      }),
    },
  ],
});
