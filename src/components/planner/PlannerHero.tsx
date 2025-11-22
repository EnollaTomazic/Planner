// src/components/planner/PlannerHero.tsx
"use client";

import * as React from "react";

import { Hero, PageShell, ProgressRing } from "@/components/ui";
import { RangeSlider } from "@/components/ui/primitives/RangeSlider";

import { PlannerStatChip } from "./PlannerStatChip";
import { SmallAgnesNoxiImage } from "./SmallAgnesNoxiImage";

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
  nudgesStat: PlannerHeroNudgesStat;
};

export function PlannerHero({
  planningEnergy,
  onPlanningEnergyChange,
  sliderFeedback,
  autopilotSummary,
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
        subtitle="Calibrate the focus dial before locking the week. Agnes maps the calm line while Noxi keeps the guardrails steady."
        glitch="subtle"
        illustration={<SmallAgnesNoxiImage />}
        illustrationAlt="Agnes and Noxi calibrating the sprint blueprint"
        sticky={false}
        bodyClassName="grid gap-[var(--space-5)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-stretch"
      >
        <section className="flex h-full flex-col gap-[var(--space-4)] rounded-card r-card-xl border border-card-hairline/60 bg-card/80 p-[var(--space-5)] shadow-neo-soft">
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-1)]">
              <span className="text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Focus dial
              </span>
              <span className="text-display-xs font-semibold tracking-[-0.01em] text-foreground">
                {planningEnergy}%
              </span>
            </div>
            <PlannerStatChip
              label="Autopilot"
              value={sliderFeedback}
              ariaLabel={sliderFeedback}
            />
          </div>
          <p className="text-subtle text-muted-foreground" aria-live="polite" aria-atomic="true">
            {autopilotSummary}
          </p>
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
            description="Tune the weekly cadence"
          />
        </section>
        <aside className="flex h-full flex-col items-center gap-[var(--space-4)] rounded-card r-card-xl border border-card-hairline/60 bg-card/80 p-[var(--space-5)] text-center shadow-neo-soft">
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
                Calibration steady at {planningEnergy}%
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
