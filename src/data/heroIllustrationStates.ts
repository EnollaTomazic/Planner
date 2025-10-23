export const HERO_ILLUSTRATION_STATES = [
  "idle",
  "hover",
  "focus",
  "alternate",
] as const;

export type HeroIllustrationState =
  (typeof HERO_ILLUSTRATION_STATES)[number];
