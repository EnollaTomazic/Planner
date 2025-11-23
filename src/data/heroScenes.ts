import type { ImageProps } from "next/image";

type ScenePosition = {
  readonly width: string;
  readonly bottom: string;
};

export type HeroSceneKey =
  | "agnes-floating"
  | "agnes-neutral"
  | "noxi-hacking"
  | "noxi-neutral";

export interface HeroSceneAsset {
  readonly src: ImageProps["src"];
  readonly alt: string;
  readonly position: ScenePosition;
}

const HERO_SCENE_LIBRARY: Record<HeroSceneKey, HeroSceneAsset> = {
  "agnes-floating": {
    src: "/hero-art/agnes-floating.svg",
    alt: "Agnes floating with holographic controls and neon bloom",
    position: {
      width: "min(calc(var(--space-8) * 8 + var(--space-5)), 70vw)",
      bottom: "-2%",
    },
  },
  "agnes-neutral": {
    src: "/hero-art/agnes-neutral.svg",
    alt: "Agnes grounded pose inside the hero blob",
    position: {
      width: "min(calc(var(--space-8) * 7 + var(--space-7)), 68vw)",
      bottom: "-4%",
    },
  },
  "noxi-hacking": {
    src: "/hero-art/noxi-hacking.svg",
    alt: "Noxi leaning in a hacking stance with neon UI",
    position: {
      width: "min(calc(var(--space-8) * 8 + var(--space-7)), 72vw)",
      bottom: "-6%",
    },
  },
  "noxi-neutral": {
    src: "/hero-art/noxi-neutral.svg",
    alt: "Noxi calm stance with soft bloom",
    position: {
      width: "min(calc(var(--space-8) * 8 + var(--space-2)), 70vw)",
      bottom: "-5%",
    },
  },
};

export function getHeroScene(key: HeroSceneKey | null | undefined) {
  if (!key) return null;
  return HERO_SCENE_LIBRARY[key] ?? null;
}
