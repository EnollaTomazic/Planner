"use client";

import * as React from "react";

import {
  BG_CLASSES,
  VARIANTS,
  VARIANT_LABELS,
  applyTheme,
  type Background,
  type ThemeState,
} from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

const BACKGROUND_VALUES: readonly Background[] = BG_CLASSES.map(
  (_, index) => index as Background,
);

const THEME_SEQUENCE: readonly ThemeState[] = VARIANTS.flatMap(({ id }) =>
  BACKGROUND_VALUES.map((bg) => ({
    variant: id,
    bg,
  })),
);

const BACKGROUND_LABELS: Record<Background, string> = {
  0: "Base",
  1: "Alt 1",
  2: "Alt 2",
  3: "VHS",
  4: "Streak",
};

const themeSequenceLength = THEME_SEQUENCE.length;

const findThemeIndex = ({ variant, bg }: ThemeState): number => {
  return THEME_SEQUENCE.findIndex(
    (candidate) => candidate.variant === variant && candidate.bg === bg,
  );
};

const getNextThemeState = (current: ThemeState): ThemeState => {
  const currentIndex = findThemeIndex(current);
  const nextIndex =
    currentIndex >= 0
      ? (currentIndex + 1) % themeSequenceLength
      : 0;
  return THEME_SEQUENCE[nextIndex];
};

export default function ThemeCycleControl(): React.JSX.Element {
  const [theme, setTheme] = useTheme();
  const variantLabel = VARIANT_LABELS[theme.variant] ?? theme.variant;
  const backgroundLabel = BACKGROUND_LABELS[theme.bg] ?? `Alt ${theme.bg}`;

  const handleCycle = React.useCallback(() => {
    setTheme((previous) => {
      const nextTheme = getNextThemeState(previous);

      if (typeof document !== "undefined") {
        const { documentElement } = document;
        if (documentElement) {
          documentElement.dataset.themePref = "persisted";
        }
      }

      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [setTheme]);

  const currentIndex = React.useMemo(() => {
    const index = findThemeIndex(theme);
    return index >= 0 ? index + 1 : 1;
  }, [theme]);

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-2)] text-body-sm text-muted-foreground">
      <span>
        Showing <span className="font-medium text-foreground">{variantLabel}</span>
        {" · "}
        <span className="font-medium text-foreground">{backgroundLabel}</span>
      </span>
      <span className="text-body-xs text-muted-foreground/80">
        {currentIndex} of {themeSequenceLength}
      </span>
      <button
        type="button"
        onClick={handleCycle}
        className="inline-flex items-center gap-[var(--space-1)] rounded-full border border-border bg-surface px-[var(--space-3)] py-[var(--space-1)] font-medium text-foreground transition-colors duration-motion-sm ease-out hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 active:text-[hsl(var(--accent-contrast))]"
      >
        Cycle theme
      </button>
    </div>
  );
}
