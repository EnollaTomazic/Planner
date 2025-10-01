import * as React from "react";
import Image from "next/image";
import { cn, withBasePath } from "@/lib/utils";
import styles from "./HeroPortraitFrame.module.css";

export interface HeroPortraitFrameProps {
  imageSrc: string;
  imageAlt: string;
  imageSizes?: string;
  priority?: boolean;
  className?: string;
  frame?: boolean;
}

const defaultSizes =
  "(max-width: 640px) 104px, (max-width: 1024px) 136px, 168px";

export default function HeroPortraitFrame({
  imageSrc,
  imageAlt,
  imageSizes = defaultSizes,
  priority = false,
  className,
  frame = true,
}: HeroPortraitFrameProps) {
  const resolvedImageSrc = withBasePath(imageSrc);
  const baseClassName = "relative isolate flex shrink-0 items-center justify-center";
  const portraitImage = (
    <Image
      src={resolvedImageSrc}
      alt={imageAlt}
      sizes={imageSizes}
      priority={priority}
      fill
      className="object-contain object-center"
    />
  );

  if (!frame) {
    return (
      <div
        className={cn(
          baseClassName,
          styles.frameless,
          "overflow-hidden rounded-full shadow-neo",
          className,
        )}
      >
        {portraitImage}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClassName, styles.framed, className)}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.6)] rounded-full blur-[var(--hero-illustration-blur,var(--portrait-glow))] opacity-[var(--hero-illustration-opacity,0.8)]",
          styles.glow,
        )}
      />
      <span
        aria-hidden
        className="glitch-rail pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.1)] rounded-full mix-blend-screen opacity-70"
      />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-neo",
          styles.rim,
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full",
            styles.inner,
          )}
        >
          {portraitImage}
        </div>
      </div>
    </div>
  );
}
