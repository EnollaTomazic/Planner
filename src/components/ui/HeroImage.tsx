"use client";

import Image, { type ImageProps } from "next/image";

import {
  DEFAULT_HERO_STATE,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { useTheme } from "@/lib/theme-context";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

type HeroImageProps = {
  readonly state?: HeroIllustrationState;
  readonly themeOverride?: Variant;
  readonly alt?: string;
} & Omit<ImageProps, "src" | "alt">;

export function HeroImage({
  state = DEFAULT_HERO_STATE,
  themeOverride,
  alt,
  className,
  ...rest
}: HeroImageProps) {
  const [theme] = useTheme();
  const variant = themeOverride ?? theme.variant;
  const asset = getHeroIllustration(variant, state);
  const rawAlt = alt ?? asset.alt ?? "";
  const normalizedAlt = rawAlt.trim();
  const finalAlt = normalizedAlt.length === 0 ? "" : normalizedAlt;
  const ariaHidden = normalizedAlt.length === 0;

  return (
    <Image
      {...rest}
      src={asset.src}
      alt={finalAlt}
      aria-hidden={ariaHidden ? true : undefined}
      className={cn(
        "mix-blend-screen opacity-[var(--hero-illustration-opacity,0.8)] blur-[var(--hero-illustration-blur,0px)]",
        className,
      )}
    />
  );
}
