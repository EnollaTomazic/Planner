"use client";

import * as React from "react";
import { Hero } from "./Hero";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import type { HomeHeroSectionProps } from "./types";

const METRICS = [
  {
    label: "Next pulse",
    value: "Retro sync · 3:00 PM",
    hint: "Confidence steady at medium.",
  },
  {
    label: "Ambient streak",
    value: "4 days",
    hint: "Signals hold — keep logging highlights.",
  },
] as const;

function FocusFigure() {
  return (
    <div className="grid place-items-center gap-[var(--space-4)] rounded-[var(--radius-2xl)] border border-border/65 bg-card/80 px-[var(--space-6)] py-[var(--space-6)] text-center shadow-[0_var(--space-2)_var(--space-6)_hsl(var(--surface)/0.28)]">
      <div className="relative grid aspect-square w-full max-w-[18rem] place-items-center rounded-full bg-gradient-to-b from-surface/65 to-surface-2/80 shadow-[0_var(--space-2)_var(--space-6)_hsl(var(--surface)/0.35)] ring-1 ring-inset ring-border/65">
        <div className="h-[72%] w-[72%]">
          <ProgressRingIcon pct={68} size="l" />
        </div>
        <span className="absolute text-[clamp(2.2rem,4vw,2.8rem)] font-semibold tracking-[-0.02em] text-foreground">
          68%
        </span>
      </div>
      <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">Focus locked</p>
      <p className="text-body text-muted-foreground text-balance">
        Flow stabilized for the current sprint window.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <p className="text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-title font-semibold tracking-[-0.01em] text-foreground">{value}</p>
      <p className="text-small text-muted-foreground">{hint}</p>
    </div>
  );
}

const HomeHeroSection = React.memo(function HomeHeroSection({
  variant,
  actions,
  headingId,
}: HomeHeroSectionProps) {
  const hasActionContent = React.useMemo(
    () => React.Children.count(actions ?? null) > 0,
    [actions],
  );

  const actionContent = hasActionContent ? (
    <div
      role="group"
      aria-label="Home hero actions"
      className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:gap-[var(--space-4)]"
    >
      {actions}
    </div>
  ) : null;

  return (
    <Hero
      aria-labelledby={headingId}
      title={<span id={headingId}>Planner control hub</span>}
      subtitle="Keep the weekly plan calm and intentional with synced pulses and a grounded focus lock."
      actions={actionContent}
      data-theme={variant}
    >
      <div className="grid gap-[var(--space-6)] md:grid-cols-12">
        <div className="space-y-[var(--space-6)] md:col-span-7">
          <div className="grid gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-border/60 bg-card/75 p-[var(--space-4)] shadow-[0_var(--space-2)_var(--space-5)_hsl(var(--surface)/0.28)] md:grid-cols-2">
            {METRICS.map((metric) => (
              <Metric key={metric.label} {...metric} />
            ))}
          </div>
        </div>
        <div className="md:col-span-5">
          <FocusFigure />
        </div>
      </div>
    </Hero>
  );
});

HomeHeroSection.displayName = "HomeHeroSection";
export { HomeHeroSection };
