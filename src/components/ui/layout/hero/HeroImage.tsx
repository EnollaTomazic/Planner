"use client";

import * as React from "react";
import Image from "next/image";
import {
  DEFAULT_HERO_STATE,
  DEFAULT_HERO_VARIANT,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { useOptionalTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type HeroImageVariant = "neo" | undefined;

export interface HeroImageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: HeroImageVariant;
  state?: HeroIllustrationState;
  alt?: string;
}

export function HeroImage({
  variant,
  state = DEFAULT_HERO_STATE,
  alt,
  className,
  ...rest
}: HeroImageProps) {
  const theme = useOptionalTheme();
  const themeVariant = theme?.[0].variant ?? DEFAULT_HERO_VARIANT;

  const { src, alt: defaultAlt } = React.useMemo(
    () => getHeroIllustration(themeVariant, state),
    [themeVariant, state],
  );

  const resolvedAlt = React.useMemo(() => {
    if (typeof alt === "string") {
      const trimmed = alt.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
    return defaultAlt;
  }, [alt, defaultAlt]);

  const dataVariant = variant ?? undefined;

  return (
    <div
      data-hero-variant={dataVariant}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...rest}
    >
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        priority={false}
        sizes="100vw"
        className="object-contain object-right md:object-center"
      />
    </div>
  );
}
