import type { ImageProps } from "next/image";
import { VARIANT_LABELS, type Variant } from "@/lib/theme";
import {
  HERO_ILLUSTRATION_STATES,
  type HeroIllustrationState,
} from "./heroIllustrationStates";
import baseIllustration from "../../public/BEST_ONE_EVAH.png";
import ambientPanel from "../../public/hero_image.png";
import ambientGradient from "../../public/hero_image2.png";

export { HERO_ILLUSTRATION_STATES };
export type { HeroIllustrationState };

export interface HeroIllustrationAsset {
  readonly src: ImageProps["src"];
  readonly alt: string;
}

export type HeroIllustrationLibrary = Record<
  Variant,
  Record<HeroIllustrationState, HeroIllustrationAsset>
>;

const CHARACTER_DESCRIPTION =
  "Planner assistant presenting a holographic dashboard scene";
const PANEL_DESCRIPTION =
  "Minimal planner dashboard glyph";
const GRADIENT_DESCRIPTION =
  "Soft gradient badge for the weekly planner";

const HERO_STATE_ASSETS: Record<HeroIllustrationState, ImageProps["src"]> = {
  idle: baseIllustration,
  hover: ambientPanel,
  focus: ambientGradient,
  alternate: ambientPanel,
};

function describeState(label: string, state: HeroIllustrationState) {
  switch (state) {
    case "hover":
      return `${PANEL_DESCRIPTION} in the ${label} theme.`;
    case "focus":
      return `${GRADIENT_DESCRIPTION} supporting the ${label} theme.`;
    case "alternate":
      return `Alternate ${label} theme ${PANEL_DESCRIPTION.toLowerCase()}.`;
    default:
      return `${CHARACTER_DESCRIPTION} tailored to the ${label} theme.`;
  }
}

function buildStateMap(
  label: string,
): Record<HeroIllustrationState, HeroIllustrationAsset> {
  const map: Partial<Record<HeroIllustrationState, HeroIllustrationAsset>> = {};

  for (const state of HERO_ILLUSTRATION_STATES) {
    const asset = HERO_STATE_ASSETS[state] ?? baseIllustration;

    map[state] = {
      src: asset,
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
    acc[variant] = buildStateMap(label);
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
