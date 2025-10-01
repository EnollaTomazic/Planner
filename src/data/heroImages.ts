import type { ImageProps } from "next/image";
import { VARIANT_LABELS, type Variant } from "@/lib/theme";
import baseIllustration from "../../public/BEST_ONE_EVAH.png";

export const HERO_ILLUSTRATION_STATES = [
  "idle",
  "hover",
  "focus",
  "alternate",
] as const;

export type HeroIllustrationState =
  (typeof HERO_ILLUSTRATION_STATES)[number];

export interface HeroIllustrationAsset {
  readonly src: ImageProps["src"];
  readonly alt: string;
}

export type HeroIllustrationLibrary = Record<
  Variant,
  Record<HeroIllustrationState, HeroIllustrationAsset>
>;

const BASE_DESCRIPTION =
  "Planner assistant presenting a holographic dashboard scene";

function describeState(label: string, state: HeroIllustrationState) {
  switch (state) {
    case "hover":
      return `${BASE_DESCRIPTION} with hover lighting in the ${label} theme.`;
    case "focus":
      return `${BASE_DESCRIPTION} with focus highlights tuned for the ${label} theme.`;
    case "alternate":
      return `Alternate ${label} theme take on the Planner assistant and dashboard.`;
    default:
      return `${BASE_DESCRIPTION} tailored to the ${label} theme.`;
  }
}

function buildStateMap(
  label: string,
  src: ImageProps["src"],
): Record<HeroIllustrationState, HeroIllustrationAsset> {
  const map: Partial<Record<HeroIllustrationState, HeroIllustrationAsset>> = {};

  for (const state of HERO_ILLUSTRATION_STATES) {
    map[state] = {
      src,
      alt: describeState(label, state),
    } satisfies HeroIllustrationAsset;
  }

  return map as Record<HeroIllustrationState, HeroIllustrationAsset>;
}

export const DEFAULT_HERO_VARIANT: Variant = "lg";
export const DEFAULT_HERO_STATE: HeroIllustrationState = "idle";

const variantEntries = Object.entries(VARIANT_LABELS) as [Variant, string][];

export const HERO_ILLUSTRATION_LIBRARY: HeroIllustrationLibrary =
  variantEntries.reduce<HeroIllustrationLibrary>((acc, [variant, label]) => {
    acc[variant] = buildStateMap(label, baseIllustration);
    return acc;
  }, {} as HeroIllustrationLibrary);

export function getHeroIllustration(
  variant: Variant,
  state: HeroIllustrationState,
): HeroIllustrationAsset {
  const variantAssets =
    HERO_ILLUSTRATION_LIBRARY[variant] ??
    HERO_ILLUSTRATION_LIBRARY[DEFAULT_HERO_VARIANT];

  return variantAssets[state] ?? variantAssets[DEFAULT_HERO_STATE];
}
