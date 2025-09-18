"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { NeomorphicFrameStyles } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface HeroPortraitFrameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src: ImageProps["src"];
  alt: string;
  sizes?: ImageProps["sizes"];
  priority?: ImageProps["priority"];
  placeholder?: ImageProps["placeholder"];
  blurDataURL?: ImageProps["blurDataURL"];
  imageClassName?: string;
}

const HeroPortraitFrame = React.forwardRef<HTMLDivElement, HeroPortraitFrameProps>(
  (
    {
      src,
      alt,
      sizes,
      priority,
      placeholder,
      blurDataURL,
      imageClassName,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative mx-auto flex w-full items-center justify-center",
          "max-w-[min(92vw,calc(var(--space-8)*6))]",
          "md:max-w-[min(45vw,calc(var(--space-8)*7))]",
          "lg:max-w-[min(32vw,calc(var(--space-8)*8))]",
          className,
        )}
        {...rest}
      >
        <NeomorphicFrameStyles />
        <div className="relative aspect-square w-full">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-[var(--space-1)] rounded-full opacity-80 shadow-glow-lg"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-[var(--space-0-5)] rounded-full border border-[hsl(var(--accent-3)/0.45)] mix-blend-screen glitch"
          />
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-[var(--edge-iris)] p-[var(--space-0-5)] [mask:linear-gradient(hsl(var(--foreground))_0_0)_content-box,linear-gradient(hsl(var(--foreground))_0_0)] [mask-composite:exclude]"
            />
            <div className="relative h-full w-full overflow-hidden rounded-full border border-[hsl(var(--border)/0.45)] bg-card/80 hero2-neomorph">
              <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                placeholder={placeholder}
                blurDataURL={blurDataURL}
                className={cn(
                  "h-full w-full object-contain object-center",
                  "bg-[radial-gradient(circle_at_center,hsl(var(--surface-2))_20%,transparent_75%)]",
                  imageClassName,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

HeroPortraitFrame.displayName = "HeroPortraitFrame";

export default HeroPortraitFrame;
