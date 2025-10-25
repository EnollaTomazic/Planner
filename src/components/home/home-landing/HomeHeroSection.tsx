"use client";

import * as React from "react";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import styles from "./HomeHeroSection.module.css";
import type { HomeHeroSectionProps } from "./types";

const HomeHeroSection = React.memo(function HomeHeroSection({
  variant,
  actions,
  headingId,
}: HomeHeroSectionProps) {
  const hasActionContent = React.useMemo(
    () => React.Children.count(actions ?? null) > 0,
    [actions],
  );

  return (
    <section className={styles.root} aria-labelledby={headingId} data-variant={variant}>
      <div className={styles.backdrop} aria-hidden />
      <div className={cn(layoutGridClassName, styles.grid)}>
        <div className={styles.copyColumn}>
          <p className={styles.eyebrow}>Glitch control brief</p>
          <div className={styles.headlineBlock}>
            <h1 id={headingId} className={styles.heading}>
              Planner control hub
            </h1>
            <p className={styles.subtitle}>
              Keep the weekly plan calm and intentional with synced pulses and a grounded focus lock.
            </p>
          </div>
          <div className={styles.metricBoard}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Next pulse</span>
              <span className={styles.metricValue}>Retro sync · 3:00 PM</span>
              <span className={styles.metricHint}>Confidence steady at medium.</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Ambient streak</span>
              <span className={styles.metricValue}>4 days</span>
              <span className={styles.metricHint}>Signals hold — keep logging highlights.</span>
            </div>
          </div>
          {hasActionContent ? (
            <div
              role="group"
              aria-label="Home hero actions"
              className={styles.actions}
            >
              {actions}
            </div>
          ) : null}
        </div>
        <div className={styles.focusColumn}>
          <div className={styles.focusCard}>
            <div className={styles.focusRing}>
              <ProgressRingIcon pct={68} size="l" />
              <span className={styles.focusValue}>68%</span>
            </div>
            <p className={styles.focusLabel}>Focus locked</p>
            <p className={styles.focusHint}>
              Flow stabilized for the current sprint window.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

HomeHeroSection.displayName = "HomeHeroSection";
export { HomeHeroSection };
