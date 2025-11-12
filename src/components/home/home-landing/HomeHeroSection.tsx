"use client";

import * as React from "react";
import ProgressRingIcon from "@/icons/ProgressRingIcon";

import { Hero } from "./Hero";
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
    <Hero
      theme={variant}
      headingId={headingId}
      eyebrow="Glitch control brief"
      title="Planner control hub"
      subtitle="Keep the weekly plan calm and intentional with synced pulses and a grounded focus lock."
      actions={hasActionContent ? actions : null}
      actionsProps={
        hasActionContent
          ? {
              role: "group",
              "aria-label": "Home hero actions",
              className: styles.actions,
            }
          : undefined
      }
      contentClassName={styles.content}
    >
      <div className={styles.metricColumn}>
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
    </Hero>
  );
});

HomeHeroSection.displayName = "HomeHeroSection";
export { HomeHeroSection };
