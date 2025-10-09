"use client";

import * as React from "react";
import { Home } from "lucide-react";
import { DEFAULT_HERO_STATE, type HeroIllustrationState } from "@/data/heroImages";
import { cn } from "@/lib/utils";
import WelcomeHeroFigure from "../WelcomeHeroFigure";
import styles from "./HomeHeroSection.module.css";
import type { HomeHeroSectionProps } from "./types";

const subtleVariants = new Set(["noir"]);

const HomeHeroSection = React.memo(function HomeHeroSection({
  variant,
  actions,
  headingId,
}: HomeHeroSectionProps) {
  const [heroState, setHeroState] = React.useState<HeroIllustrationState>(
    DEFAULT_HERO_STATE,
  );
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

  const handleHeroPointerEnter = React.useCallback(() => {
    setHeroState("hover");
  }, []);

  const handleHeroPointerLeave = React.useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >((event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof Node &&
        event.currentTarget.contains(activeElement)
      ) {
        setHeroState("focus");
        return;
      }
    }
    setHeroState(DEFAULT_HERO_STATE);
  }, []);

  const handleHeroFocus = React.useCallback(() => {
    setHeroState("focus");
  }, []);

  const handleHeroBlur = React.useCallback<React.FocusEventHandler<HTMLDivElement>>(
    (event) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
        return;
      }
      setHeroState(DEFAULT_HERO_STATE);
    },
    [],
  );

  return (
    <div
      className={cn(
        "grid gap-[var(--space-5)] md:grid-cols-12 md:items-center",
        styles.root,
      )}
      data-theme-variant={variant}
      data-hero-state={heroState}
      onPointerEnter={handleHeroPointerEnter}
      onPointerLeave={handleHeroPointerLeave}
      onFocusCapture={handleHeroFocus}
      onBlurCapture={handleHeroBlur}
    >
      <div className="flex flex-col gap-[var(--space-4)] md:col-span-6">
        <div className="flex items-center gap-[var(--space-2)] text-muted-foreground">
          <Home aria-hidden="true" className="size-[var(--icon-size-lg)]" />
          <span className="text-label font-semibold uppercase tracking-[0.02em]">
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
      <div
        className={cn(
          "flex justify-center md:col-span-6 md:justify-end",
          styles.mediaColumn,
        )}
      >
        <WelcomeHeroFigure
          className="w-full max-w-[calc(var(--space-8)*4)] md:max-w-[calc(var(--space-8)*4.5)] lg:max-w-[calc(var(--space-8)*5)]"
          haloTone={haloTone}
          showGlitchRail={showGlitchRail}
          framed={false}
          variant={variant}
          state={heroState}
        />
      </div>
    </div>
  );
});

HomeHeroSection.displayName = "HomeHeroSection";

export default HomeHeroSection;
