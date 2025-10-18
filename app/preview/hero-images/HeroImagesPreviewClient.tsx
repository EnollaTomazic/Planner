"use client";

import * as React from "react";
import { Badge, Button, Hero } from "@/components/ui";
import {
  HERO_ILLUSTRATION_STATES,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { VARIANTS, VARIANT_LABELS, type Variant } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const HERO_STATE_LABELS: Record<HeroIllustrationState, string> = {
  idle: "Idle",
  hover: "Hover",
  focus: "Focus",
  alternate: "Alternate",
};

const HERO_STATE_DESCRIPTIONS: Record<HeroIllustrationState, string> = {
  idle: "Baseline illustration tuned for the current theme.",
  hover: "Hover lighting enhances energy without overshooting contrast.",
  focus: "Focus state introduces ring-friendly highlights for accessibility.",
  alternate: "Alternate take balances saturation for dark-forward palettes.",
};

type HeroPreviewCombo = {
  readonly variant: Variant;
  readonly state: HeroIllustrationState;
};

const HERO_COMBOS: readonly HeroPreviewCombo[] = VARIANTS.flatMap(({ id }) =>
  HERO_ILLUSTRATION_STATES.map((state) => ({ variant: id, state })),
);

const HERO_CYCLE_INTERVAL_MS = 6000;

function findComboIndex(variant: Variant, state: HeroIllustrationState): number {
  const index = HERO_COMBOS.findIndex(
    (combo) => combo.variant === variant && combo.state === state,
  );
  return index >= 0 ? index : 0;
}

interface HeroImagesPreviewClientProps {
  readonly initialVariant: Variant;
  readonly initialState: HeroIllustrationState;
  readonly autoplay?: boolean;
}

export default function HeroImagesPreviewClient({
  initialVariant,
  initialState,
  autoplay = true,
}: HeroImagesPreviewClientProps) {
  const [, setTheme] = useTheme();
  const reduceMotion = usePrefersReducedMotion();
  const targetIndex = React.useMemo(
    () => findComboIndex(initialVariant, initialState),
    [initialVariant, initialState],
  );
  const [index, setIndex] = React.useState(targetIndex);
  const [autoPlayEnabled, setAutoPlayEnabled] = React.useState(
    autoplay && !reduceMotion,
  );

  React.useEffect(() => {
    setIndex(targetIndex);
  }, [targetIndex]);

  React.useEffect(() => {
    if (reduceMotion && autoPlayEnabled) {
      setAutoPlayEnabled(false);
    }
  }, [reduceMotion, autoPlayEnabled]);

  const currentCombo = HERO_COMBOS[index] ?? HERO_COMBOS[0];
  const currentVariantLabel = VARIANT_LABELS[currentCombo.variant];
  const currentStateLabel = HERO_STATE_LABELS[currentCombo.state];
  const currentStateDescription = HERO_STATE_DESCRIPTIONS[currentCombo.state];

  React.useEffect(() => {
    setTheme((theme) => {
      if (theme.variant === currentCombo.variant && theme.bg === 0) {
        return theme;
      }
      return { variant: currentCombo.variant, bg: 0 };
    });
  }, [currentCombo.variant, setTheme]);

  React.useEffect(() => {
    if (!autoPlayEnabled) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_COMBOS.length);
    }, HERO_CYCLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [autoPlayEnabled]);

  const selectCombo = React.useCallback(
    (variant: Variant, state: HeroIllustrationState) => {
      setAutoPlayEnabled(false);
      setIndex(findComboIndex(variant, state));
    },
    [],
  );

  const handleVariantClick = React.useCallback(
    (variant: Variant) => {
      selectCombo(variant, currentCombo.state);
    },
    [currentCombo.state, selectCombo],
  );

  const handleStateClick = React.useCallback(
    (state: HeroIllustrationState) => {
      selectCombo(currentCombo.variant, state);
    },
    [currentCombo.variant, selectCombo],
  );

  const handlePrevious = React.useCallback(() => {
    setAutoPlayEnabled(false);
    setIndex((prev) => (prev - 1 + HERO_COMBOS.length) % HERO_COMBOS.length);
  }, []);

  const handleNext = React.useCallback(() => {
    setAutoPlayEnabled(false);
    setIndex((prev) => (prev + 1) % HERO_COMBOS.length);
  }, []);

  const handleToggleAutoplay = React.useCallback(() => {
    setAutoPlayEnabled((prev) => !prev && !reduceMotion);
  }, [reduceMotion]);

  return (
    <div className="space-y-[var(--space-5)]">
      <div className="space-y-[var(--space-3)]">
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Badge tone="accent">{currentVariantLabel}</Badge>
          <Badge tone="neutral">{currentStateLabel}</Badge>
          <span className="text-caption text-muted-foreground">
            {currentStateDescription}
          </span>
        </div>
        <p className="sr-only" aria-live="polite" data-hero-preview-announcement>
          {currentVariantLabel} theme · {currentStateLabel} illustration.
        </p>
        <Hero
          data-testid="hero-preview"
          heading={`${currentVariantLabel} planner hero`}
          eyebrow="Gallery hero preview"
          subtitle={currentStateDescription}
          sticky={false}
          topClassName="top-0"
          illustrationState={currentCombo.state}
          actions={
            <Button size="sm" type="button">
              Launch planner
            </Button>
          }
        >
          <div className="space-y-[var(--space-2)] text-ui text-muted-foreground">
            <p>
              Confirm the hero illustration aligns with the {currentVariantLabel} theme without
              losing clarity.
            </p>
            <p>
              Cycle through hero states to validate lighting, focus treatment, and alternate
              palette balances.
            </p>
          </div>
        </Hero>
      </div>

      <div className="space-y-[var(--space-4)]">
        <div className="space-y-[var(--space-2)]">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Theme variants
          </p>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {VARIANTS.map(({ id, label }) => (
              <Button
                key={id}
                size="sm"
                type="button"
                variant={currentCombo.variant === id ? "default" : "neo"}
                tone={currentCombo.variant === id ? "accent" : "primary"}
                aria-pressed={currentCombo.variant === id}
                onClick={() => handleVariantClick(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-[var(--space-2)]">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Illustration states
          </p>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {HERO_ILLUSTRATION_STATES.map((state) => (
              <Button
                key={state}
                size="sm"
                type="button"
                variant={currentCombo.state === state ? "default" : "neo"}
                tone={currentCombo.state === state ? "accent" : "primary"}
                aria-pressed={currentCombo.state === state}
                onClick={() => handleStateClick(state)}
              >
                {HERO_STATE_LABELS[state]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button size="sm" type="button" variant="neo" onClick={handlePrevious}>
            Previous
          </Button>
          <Button size="sm" type="button" variant="neo" onClick={handleNext}>
            Next
          </Button>
          <Button
            size="sm"
            type="button"
            variant="quiet"
            aria-pressed={autoPlayEnabled}
            onClick={handleToggleAutoplay}
          >
            {autoPlayEnabled ? "Pause auto cycle" : "Resume auto cycle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
