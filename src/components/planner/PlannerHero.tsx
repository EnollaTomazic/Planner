// src/components/planner/PlannerHero.tsx
"use client";

import * as React from "react";

import {
  Alert,
  Button,
  GlitchProgress,
  Hero,
  PageShell,
  ProgressRing,
} from "@/components/ui";
import { RangeSlider } from "@/components/ui/primitives/RangeSlider";

import { PlannerStatChip } from "./PlannerStatChip";
import { SmallAgnesNoxiImage } from "./SmallAgnesNoxiImage";

type PlannerHeroQuickLink = {
  id: string;
  label: string;
  description?: string;
  href: string;
};

type PlannerHeroNudgesStat = {
  value: string;
  count: number;
  ariaLabel: string;
};

type PlannerHeroProps = {
  planningEnergy: number;
  onPlanningEnergyChange: (value: number) => void;
  sliderFeedback: string;
  autopilotSummary: string;
  quickLinks: PlannerHeroQuickLink[];
  nudgesStat: PlannerHeroNudgesStat;
};

export function PlannerHero({
  planningEnergy,
  onPlanningEnergyChange,
  sliderFeedback,
  autopilotSummary,
  quickLinks,
  nudgesStat,
}: PlannerHeroProps) {
  const handleSliderChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onPlanningEnergyChange(Number(event.target.value));
    },
    [onPlanningEnergyChange],
  );

  return (
    <PageShell as="header" grid className="py-[var(--space-7)]">
      <Hero
        className="col-span-full md:col-span-12"
        eyebrow="Planner autopilot"
        title="Your sprint blueprint"
        subtitle="Tweak the focus dial before locking the week. Agnes maps the calm line, Noxi keeps the glitch guardrails on. Every suggestion stays editable."
        glitch="default"
        icon={
          <GlitchProgress
            value={planningEnergy}
            size="xl"
            aria-label="Planner autopilot energy"
          />
        }
        illustration={<SmallAgnesNoxiImage />}
        illustrationAlt="Agnes and Noxi calibrating the sprint blueprint"
        sticky={false}
        bodyClassName="grid gap-[var(--space-5)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        actions={
          quickLinks.length ? (
            <nav aria-label="Planner quick suggestions" className="w-full">
              <ul className="m-0 flex w-full list-none flex-wrap gap-[var(--space-2)] p-0">
                {quickLinks.map((link) => (
                  <li key={link.id} className="min-w-0 flex-1">
                    <a
                      className="chip chip-token chip-surface chip-border chip-ring flex min-h-[var(--space-8)] min-w-[min(16rem,100%)] flex-col gap-[var(--space-1)] rounded-card px-[var(--space-3)] py-[var(--space-2)] text-left no-underline transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-[var(--ring-size-2)] focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-0"
                      href={link.href}
                    >
                      <span className="text-label font-medium uppercase tracking-[0.12em] text-accent">
                        {link.label}
                      </span>
                      {link.description ? (
                        <span className="text-subtle text-muted-foreground">
                          {link.description}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null
        }
      >
        <section className="flex flex-col gap-[var(--space-4)] rounded-card r-card-xl border border-card-hairline/60 bg-card/70 p-[var(--space-5)] shadow-neo-soft">
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-1)]">
              <span className="text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Focus dial
              </span>
              <span className="text-display-xs font-semibold tracking-[-0.01em] text-foreground">
                {planningEnergy}%
              </span>
            </div>
            <GlitchProgress
              value={planningEnergy}
              size="lg"
              aria-hidden
              className="text-accent"
            />
          </div>
          <Alert
            tone="info"
            variant="subtle"
            liveRegion="polite"
            aria-atomic="true"
          >
            {autopilotSummary}
          </Alert>
          <RangeSlider
            className="w-full"
            label="Adjust energy"
            min={20}
            max={100}
            step={1}
            value={planningEnergy}
            onChange={handleSliderChange}
            minLabel="20%"
            maxLabel="100%"
            description={sliderFeedback}
          />
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <Button size="sm" variant="quiet" tone="accent">
              Retry suggestions
            </Button>
            <Button size="sm" variant="default" tone="accent">
              Edit draft
            </Button>
            <Button size="sm" variant="quiet">
              Cancel
            </Button>
          </div>
        </section>
        <aside className="flex flex-col items-center gap-[var(--space-4)] rounded-card r-card-xl border border-card-hairline/60 bg-card/70 p-[var(--space-5)] text-center shadow-neo-soft">
          <div className="flex flex-col items-center gap-[var(--space-3)]">
            <ProgressRing
              value={planningEnergy}
              size="l"
              aria-label={`Focus calibration ${planningEnergy}%`}
              className="size-[clamp(8rem,20vw,9.5rem)] text-accent"
              trackClassName="text-foreground/15"
            />
            <div className="flex flex-col items-center gap-[var(--space-1)]">
              <span className="text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Focus calibration
              </span>
              <span className="text-title font-semibold text-foreground">
                Calibration stable at {planningEnergy}%
              </span>
            </div>
          </div>
          <PlannerStatChip
            label="Nudges today"
            value={nudgesStat.value}
            ariaLabel={nudgesStat.ariaLabel}
          />
          <p className="text-subtle text-muted-foreground">
            {nudgesStat.count === 0
              ? "No nudges queued yet."
              : `${nudgesStat.count.toLocaleString()} nudges queued for today.`}
          </p>
        </aside>
      </Hero>
    </PageShell>
  );
}
