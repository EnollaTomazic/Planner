"use client";

import * as React from "react";
import { Home } from "lucide-react";
import WelcomeHeroFigure from "../WelcomeHeroFigure";
import type { HomeHeroSectionProps } from "./types";

const subtleVariants = new Set(["noir"]);

export default function HomeHeroSection({
  variant,
  actions,
  headingId,
}: HomeHeroSectionProps) {
  const haloTone = React.useMemo(
    () => (subtleVariants.has(variant) ? "subtle" : "default"),
    [variant],
  );
  const showGlitchRail = React.useMemo(
    () => !subtleVariants.has(variant),
    [variant],
  );

  const hasActionContent = React.useMemo(
    () => React.Children.count(actions ?? null) > 0,
    [actions],
  );

  return (
    <div
      className="grid gap-[var(--space-5)] md:grid-cols-12 md:items-center"
      data-theme-variant={variant}
    >
      <div className="flex flex-col gap-[var(--space-4)] md:col-span-6">
        <div className="flex items-center gap-[var(--space-2)] text-muted-foreground">
          <Home aria-hidden="true" className="size-[var(--icon-size-lg)]" />
          <span className="text-label font-semibold uppercase">
            Planner
          </span>
        </div>
        <div className="space-y-[var(--space-3)]">
          <h1
            id={headingId}
            className="text-balance text-title-lg font-semibold tracking-[-0.01em] text-foreground"
          >
            Welcome to Planner
          </h1>
          <p className="text-body text-muted-foreground">
            Plan your day, track goals, and review games.
          </p>
        </div>
        {hasActionContent ? (
          <div
            role="group"
            aria-label="Home hero actions"
            className="flex flex-wrap items-center gap-[var(--space-3)]"
          >
            {actions}
          </div>
        ) : null}
      </div>
      <div className="flex justify-center md:col-span-6 md:justify-end">
        <WelcomeHeroFigure
          className="w-full max-w-[calc(var(--space-8)*4)] md:max-w-[calc(var(--space-8)*4.5)] lg:max-w-[calc(var(--space-8)*5)]"
          haloTone={haloTone}
          showGlitchRail={showGlitchRail}
          framed={false}
        />
      </div>
    </div>
  );
}
