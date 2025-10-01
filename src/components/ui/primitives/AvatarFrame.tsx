import * as React from "react";
import type { ImageProps } from "next/image";

import { cn } from "@/lib/utils";

import styles from "./AvatarFrame.module.css";

type AvatarFrameSize = "sm" | "md" | "lg";

type MediaElement = React.ReactElement<
  ImageProps | React.ImgHTMLAttributes<HTMLImageElement>
>;

type AvatarFrameOwnProps<T extends React.ElementType = "div"> = {
  as?: T;
  frame?: boolean;
  size?: AvatarFrameSize;
  media?: MediaElement;
  before?: React.ReactNode;
  after?: React.ReactNode;
  children?: React.ReactNode;
  innerClassName?: string;
  surfaceClassName?: string;
  rimClassName?: string;
  glowClassName?: string;
  railClassName?: string;
};

export type AvatarFrameProps<T extends React.ElementType = "div"> =
  AvatarFrameOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof AvatarFrameOwnProps<T>>;

const sizeClassNames: Record<AvatarFrameSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

function coerceMedia(media?: MediaElement) {
  if (!media || !React.isValidElement(media)) {
    return media;
  }

  return React.cloneElement(media, {
    className: cn(
      "h-full w-full object-contain object-[center_20%]",
      styles.media,
      media.props.className,
    ),
  });
}

function AvatarFrame<T extends React.ElementType = "div">({
  as,
  frame = true,
  size = "md",
  media,
  before,
  after,
  children,
  className,
  innerClassName,
  surfaceClassName,
  rimClassName,
  glowClassName,
  railClassName,
  ...rest
}: AvatarFrameProps<T>) {
  const Comp = (as ?? "div") as React.ElementType;
  const processedMedia = coerceMedia(media);

  return (
    <Comp
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center",
        styles.root,
        sizeClassNames[size],
        className,
      )}
      {...rest}
    >
      {before}
      {frame ? (
        <>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.6)] rounded-full blur-[var(--hero-illustration-blur,var(--portrait-glow))] opacity-[var(--hero-illustration-opacity,0.8)]",
              styles.glow,
              glowClassName,
            )}
          />
          <span
            aria-hidden
            className={cn(
              "glitch-rail pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.1)] rounded-full mix-blend-screen opacity-[var(--glitch-intensity-hero-rail,0.74)]",
              railClassName,
            )}
          />
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full shadow-depth-outer",
              styles.rim,
              rimClassName,
            )}
          >
            <div
              className={cn(
                "relative aspect-[1/1] w-full overflow-hidden rounded-full",
                styles.inner,
                innerClassName,
              )}
            >
              {processedMedia}
              {children}
            </div>
          </div>
        </>
      ) : (
        <div
          className={cn(
            "relative aspect-[1/1] w-full overflow-hidden rounded-full shadow-depth-outer",
            styles.framelessSurface,
            surfaceClassName,
          )}
        >
          {processedMedia}
          {children}
        </div>
      )}
      {after}
    </Comp>
  );
}

AvatarFrame.displayName = "AvatarFrame";

export default AvatarFrame;
