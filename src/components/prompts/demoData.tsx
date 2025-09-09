import * as React from "react";
import type { Goal } from "@/lib/types";
import { colorTokens, spacingTokens, radiusTokens } from "@/lib/tokens";

// Re-export tokens for demo components
export { colorTokens, spacingTokens, radiusTokens };

export const glowTokens = ["--glow-strong", "--glow-soft"];

export const focusRingToken = "--theme-ring";
export const radiusClasses = [
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
];

export const typeRamp = ["eyebrow", "title", "subtitle", "body", "caption"];

export const FRUIT_ITEMS = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
];

export const NEON_ICONS = [
  { kind: "clock", on: true },
  { kind: "brain", on: true },
  { kind: "file", on: false },
] as const;

export const UPDATES: React.ReactNode[] = [
  <>
    Global styles are now modularized into <code>animations.css</code>,<code>overlays.css</code>, and
    <code>utilities.css</code>.
  </>,
  <>
    Control height token <code>--control-h</code> now snaps to 44px to align with the 4px spacing grid.
  </>,
  <>
    Buttons now default to the 40px <code>md</code> size and follow a 36/40/44px scale.
  </>,
  <>
    WeekPicker scrolls horizontally with snap points, showing 2–3 days at a time on smaller screens.
  </>,
  <>Review status dots blink to highlight wins and losses.</>,
  <>
    Hero dividers now use <code>var(--space-4)</code> top padding and tokenized side offsets via <code>var(--space-2)</code>.
  </>,
  <>
    IconButton adds a compact <code>xs</code> size.
  </>,
  <>DurationSelector active state uses accent color tokens.</>,
  <>
    Color gallery groups tokens into Aurora, Neutrals, and Accents palettes with tabs.
  </>,
];

export const GOAL_DEMO_ITEMS: Goal[] = [
  { id: "g1", title: "Demo active goal", done: false, createdAt: Date.now() },
  {
    id: "g2",
    title: "Demo done goal",
    done: true,
    createdAt: Date.now() - 86_400_000,
  },
];
