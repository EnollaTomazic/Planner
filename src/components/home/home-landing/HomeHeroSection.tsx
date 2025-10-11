"use client";

import * as React from "react";
import { Home, Sparkles } from "lucide-react";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import PortraitFrame, { type PoseVariant } from "../PortraitFrame";
import styles from "./HomeHeroSection.module.css";
import type { HomeHeroSectionProps } from "./types";

const darkPoseVariants = new Set<PoseVariant>(["demon-leading", "back-to-back"]);
const shadowThemes = new Set(["noir", "hardstuck"]);

type HeroFocusDialProps = {
  value: number;
  onChange: (value: number) => void;
};

function HeroFocusDial({ value, onChange }: HeroFocusDialProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const nextValue = Number.parseInt(event.target.value, 10);
      setInternalValue(nextValue);
      onChange(nextValue);
    },
    [onChange],
  );

  const dialLabelId = React.useId();

  return (
    <div className={styles.dial} aria-labelledby={dialLabelId}>
      <div
        className={cn(
          styles.dialRing,
          prefersReducedMotion && styles.dialRingReduced,
        )}
      >
        <ProgressRingIcon pct={internalValue} size="l" />
        <span className={styles.dialValue}>{internalValue}%</span>
        <span className={styles.dialCaption}>Focus locked</span>
      </div>
      <label htmlFor={`${dialLabelId}-input`} className={styles.dialLabel}>
        <span id={dialLabelId} className="text-label font-medium tracking-[0.06em]">
          Planner equilibrium
        </span>
        <input
          id={`${dialLabelId}-input`}
          type="range"
          min={20}
          max={100}
          step={1}
          value={internalValue}
          onChange={handleChange}
          aria-valuemin={20}
          aria-valuemax={100}
          aria-valuenow={internalValue}
          aria-describedby={`${dialLabelId}-feedback`}
          className={styles.dialSlider}
        />
        <span
          id={`${dialLabelId}-feedback`}
          aria-live="polite"
          className={styles.dialFeedback}
        >
          {internalValue >= 75
            ? "High-energy sprint."
            : internalValue <= 40
              ? "Grounded focus day."
              : "Steady climb."}
        </span>
      </label>
    </div>
  );
}

const HomeHeroSection = React.memo(function HomeHeroSection({
  variant,
  actions,
  headingId,
}: HomeHeroSectionProps) {
  const [focusPercent, setFocusPercent] = React.useState(68);
  const hasActionContent = React.useMemo(
    () => React.Children.count(actions ?? null) > 0,
    [actions],
  );

  const pose: PoseVariant = React.useMemo(() => {
    if (shadowThemes.has(variant)) {
      return "demon-leading";
    }
    if (variant === "aurora" || variant === "ocean") {
      return "angel-leading";
    }
    return "back-to-back";
  }, [variant]);

  const auraTone = darkPoseVariants.has(pose) ? "dark" : "light";

  return (
    <section className={styles.root} aria-labelledby={headingId}>
      <div className={styles.backdrop} aria-hidden />
      <div className={styles.grid}>
        <div className={styles.contentColumn}>
          <div className={styles.eyebrowRow}>
            <Home aria-hidden className="size-[var(--icon-size-lg)]" />
            <span className={styles.eyebrowLabel}>Planner Control Hub</span>
            <span className={styles.eyebrowStatus}>
              <Sparkles aria-hidden className="size-[var(--icon-size-sm)]" />
              AI-assisted draft
            </span>
          </div>
          <div className={styles.headlineBlock}>
            <h1 id={headingId} className={styles.heading}>
              Lavender-Glitch cockpit
            </h1>
            <p className={styles.subtitle}>
              Angel Agnes sketches the calm horizon while Deamon Noxi keeps the neon rails warmed up.
              Review the plan, edit anything, or reroll their suggestions before launch.
            </p>
          </div>
          <div className={styles.hudFrame}>
            <div className={styles.hudMetric}>
              <span className={styles.hudMetricLabel}>Next pulse</span>
              <span className={styles.hudMetricValue}>Retro sync · 3:00 PM</span>
              <span className={styles.hudMetricHint}>Confidence: medium — tap retry to refresh.</span>
            </div>
            <div className={styles.hudMetric}>
              <span className={styles.hudMetricLabel}>Ambient streak</span>
              <span className={styles.hudMetricValue}>4 days</span>
              <span className={styles.hudMetricHint}>Drafted by Agnes, tweak goals anytime.</span>
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
        <div className={styles.portraitColumn}>
          <div className={cn(styles.portraitCard, styles[`tone-${auraTone}`])}>
            <PortraitFrame pose={pose} transparentBackground className={styles.portraitFrame} />
            <div className={styles.portraitMeta}>
              <div className={styles.metaHeader}>
                <p className={styles.metaLabel}>Sidekick link</p>
                <p className={styles.metaDescription}>
                  Agnes charts the serenity arcs. Noxi stress-tests the glitch vectors. Swap their pose to match your theme mood.
                </p>
              </div>
              <HeroFocusDial value={focusPercent} onChange={setFocusPercent} />
              <div className={styles.metaFooter}>
                <span className={styles.metaPill}>Retry</span>
                <span className={styles.metaPill}>Edit draft</span>
                <span className={styles.metaPill}>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HomeHeroSection.displayName = "HomeHeroSection";

export default HomeHeroSection;
