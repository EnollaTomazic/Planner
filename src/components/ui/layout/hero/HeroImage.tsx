"use client";

import * as React from "react";
import Image from "next/image";

import {
  DEFAULT_HERO_VARIANT,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { useOptionalTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

import type { HeroStyleResult } from "./useHeroStyles";

const heroImageSizes =
  "(max-width: 767px) 68vw, (max-width: 1279px) 46vw, (max-width: 1919px) 420px, 480px";

export interface HeroImageProps {
  variant: HeroStyleResult["heroVariant"];
  state: HeroIllustrationState;
  alt: string;
}

export function HeroImage({ variant, state, alt }: HeroImageProps) {
  const themeEntry = useOptionalTheme();
  const themeVariant = themeEntry?.[0].variant ?? DEFAULT_HERO_VARIANT;

  const { src, alt: computedAlt } = React.useMemo(
    () => getHeroIllustration(themeVariant, state),
    [themeVariant, state],
  );

  if (variant !== "neo") {
    return null;
  }

  const resolvedAlt = alt?.trim().length ? alt : computedAlt;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-card">
      <div
        className={cn(
          "relative ml-auto flex h-full w-full items-end justify-end",
          "px-[var(--space-2)] pb-[var(--space-2)]",
          "sm:px-[var(--space-3)] sm:pb-[var(--space-3)]",
          "lg:px-[var(--space-4)] lg:pb-[var(--space-4)]",
        )}
      >
        <div className="relative aspect-[4/5] w-full max-w-[min(28rem,64%)]">
          <Image
            src={src}
            alt={resolvedAlt}
            fill
            sizes={heroImageSizes}
            className="object-contain object-bottom"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
