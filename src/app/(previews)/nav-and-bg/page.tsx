"use client";

import * as React from "react";
import type { Metadata } from "next";

import SiteChrome from "@/components/chrome/SiteChrome";
import NavBar from "@/components/chrome/NavBar";
import { DecorLayer, PageShell } from "@/components/ui";
import {
  BG_CLASSES,
  VARIANTS,
  VARIANT_LABELS,
  applyTheme,
  type Background,
  type ThemeState,
} from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Navigation & background preview",
  description:
    "Preview how the global navigation and background layers render across every theme variant and backdrop.",
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): never[] {
  return [];
}

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

function ThemeCycleControl() {
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
        className="inline-flex items-center gap-[var(--space-1)] rounded-full border border-border bg-surface px-[var(--space-3)] py-[var(--space-1)] font-medium text-foreground transition-colors duration-quick ease-out hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 active:text-[hsl(var(--accent-contrast))]"
      >
        Cycle theme
      </button>
    </div>
  );
}

export default function NavAndBackgroundPreviewPage() {
  return (
    <React.Fragment>
      <div aria-hidden className="page-backdrop">
        <div className="page-shell">
          <DecorLayer className="page-backdrop__layer" variant="grid" />
          <DecorLayer className="page-backdrop__layer" variant="drip" />
        </div>
      </div>
      <SiteChrome>
        <div className="relative z-10">
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-[60vh] flex-col py-[var(--space-8)]"
          >
            <PageShell className="flex flex-col gap-[var(--space-6)]">
              <header className="max-w-2xl space-y-[var(--space-2)]">
                <p className="text-label text-accent-foreground/80">Theme preview</p>
                <h1 className="text-display-sm font-semibold text-foreground">
                  Navigation & background layering
                </h1>
                <p className="text-body-md text-muted-foreground">
                  Cycle through every variant and background pairing to verify that the navigation chrome and decorative backdrops stay in sync.
                </p>
                <ThemeCycleControl />
              </header>
              <section className="rounded-[var(--radius-2xl)] border border-border/80 bg-surface/90 p-[var(--space-6)] shadow-[var(--shadow-outline-subtle)] backdrop-blur-md">
                <div className="mx-auto max-w-4xl">
                  <NavBar />
                </div>
              </section>
            </PageShell>
          </main>
        </div>
      </SiteChrome>
    </React.Fragment>
  );
}
