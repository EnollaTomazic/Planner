import type { Goal } from "@/lib/types";
import { colorTokens, spacingTokens, radiusTokens } from "@/lib/tokens";

// Re-export tokens for demo components
export { colorTokens, spacingTokens, radiusTokens };

export const glowTokens = ["--glow-strong", "--glow-soft"];

export const focusRingToken = "--theme-ring";
export const radiusClasses = [
  "rounded-[var(--radius-md)]",
  "rounded-[var(--radius-lg)]",
  "rounded-card r-card-md",
  "rounded-card r-card-lg",
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

export const GOAL_DEMO_ITEMS: Goal[] = [
  { id: "g1", title: "Demo active goal", done: false, createdAt: Date.now() },
  {
    id: "g2",
    title: "Demo done goal",
    done: true,
    createdAt: Date.now() - 86_400_000,
  },
];
