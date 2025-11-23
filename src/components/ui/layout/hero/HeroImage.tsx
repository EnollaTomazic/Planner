"use client";

import * as React from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import {
  DEFAULT_HERO_STATE,
  DEFAULT_HERO_VARIANT,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { getHeroScene, type HeroSceneKey } from "@/data/heroScenes";
import { useOptionalTheme } from "@/lib/theme-context";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";
import sceneStyles from "./HeroScene.module.css";

export interface HeroImageProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: HeroIllustrationState;
  alt?: string;
  themeOverride?: Variant;
  imageProps?: Omit<ImageProps, "src" | "alt">;
  scene?: HeroSceneKey | null;
}

export function HeroImage({
  state = DEFAULT_HERO_STATE,
  alt,
  themeOverride,
  imageProps,
  scene,
  className,
  ...rest
}: HeroImageProps) {
  const theme = useOptionalTheme();
  const variant = themeOverride ?? theme?.[0].variant ?? DEFAULT_HERO_VARIANT;

  const { src, alt: defaultAlt } = React.useMemo(
    () => getHeroIllustration(variant, state),
    [variant, state],
  );

  const sceneAsset = React.useMemo(() => getHeroScene(scene), [scene]);

  const normalizedAlt = React.useMemo(() => {
    const value =
      typeof alt === "string"
        ? alt
        : sceneAsset?.alt ?? defaultAlt ?? "";
    return value.trim();
  }, [alt, defaultAlt, sceneAsset?.alt]);

  const resolvedAlt = normalizedAlt.length > 0 ? normalizedAlt : "";
  const ariaHidden = normalizedAlt.length === 0;

  const { className: imageClassName, sizes = "100vw", priority = false, ...restImageProps } =
    imageProps ?? {};

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...rest}
    >
      <Image
        src={src}
        alt={resolvedAlt}
        aria-hidden={ariaHidden ? true : undefined}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-contain object-right md:object-center",
          "mix-blend-screen opacity-[var(--hero-illustration-opacity,0.8)] blur-[var(--hero-illustration-blur,0px)]",
          imageClassName,
        )}
        {...restImageProps}
      />
      {sceneAsset ? (
        <div className={sceneStyles.sceneLayer}>
          <Image
            src={sceneAsset.src}
            alt={sceneAsset.alt}
            width={720}
            height={880}
            priority={priority}
            sizes={sizes}
            className={cn(sceneStyles.sceneImage)}
            data-scene={scene}
            style={{
              width: sceneAsset.position.width,
              bottom: sceneAsset.position.bottom,
            }}
            {...restImageProps}
          />
        </div>
      ) : null}
    </div>
  );
}
