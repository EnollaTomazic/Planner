"use client";

import * as React from "react";
import NextImage from "next/image";
import type { ImageProps } from "next/image";
import {
  DEFAULT_HERO_STATE,
  DEFAULT_HERO_VARIANT,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import type { Variant } from "@/lib/theme";
import { useOptionalTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type ForwardedImageProps = Omit<ImageProps, "src" | "alt" | "className">;

export interface HeroImageProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: HeroIllustrationState;
  alt?: string;
  themeOverride?: Variant;
  imageClassName?: string;
  imageProps?: ForwardedImageProps;
}

export function HeroImage({
  state = DEFAULT_HERO_STATE,
  alt,
  themeOverride,
  className,
  imageClassName,
  imageProps,
  ...wrapperProps
}: HeroImageProps) {
  const theme = useOptionalTheme();
  const variant = themeOverride ?? theme?.[0].variant ?? DEFAULT_HERO_VARIANT;

  const { src, alt: defaultAlt } = React.useMemo(
    () => getHeroIllustration(variant, state),
    [variant, state],
  );

  const resolvedAlt = React.useMemo(() => {
    const rawAlt = alt ?? defaultAlt ?? "";
    const trimmed = rawAlt.trim();
    return trimmed.length === 0 ? "" : trimmed;
  }, [alt, defaultAlt]);

  const ariaHidden = resolvedAlt.length === 0;

  const { fill, sizes, priority, ...restImageProps } = imageProps ?? {};

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...wrapperProps}
    >
      <NextImage
        {...restImageProps}
        src={src}
        alt={resolvedAlt}
        aria-hidden={ariaHidden ? true : undefined}
        fill={fill ?? true}
        priority={priority ?? false}
        sizes={sizes ?? "100vw"}
        className={cn(
          "object-contain object-right md:object-center",
          "mix-blend-screen opacity-[var(--hero-illustration-opacity,0.8)] blur-[var(--hero-illustration-blur,0px)]",
          imageClassName,
        )}
      />
    </div>
  );
}
