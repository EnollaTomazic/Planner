import * as React from "react";
import type { ComponentProps } from "react";
import Image from "next/image";
import { cn, withBasePath } from "@/lib/utils";
import styles from "./WelcomeHeroFigure.module.css";

type WelcomeHeroFigureTone = "default" | "subtle";

const defaultSizes =
  "(max-width: 767px) 100vw, (max-width: 1023px) calc(100vw / 3), calc(100vw * 5 / 12)";

const heroImageSrc = "/BEST_ONE_EVAH.png";
export interface WelcomeHeroFigureProps {
  className?: string;
  imageSizes?: string;
  haloTone?: WelcomeHeroFigureTone;
  showGlitchRail?: boolean;
  framed?: boolean;
  eager?: boolean;
}

export default function WelcomeHeroFigure({
  className,
  imageSizes = defaultSizes,
  haloTone = "default",
  showGlitchRail,
  framed = true,
  eager = false,
}: WelcomeHeroFigureProps) {
  const shouldShowGlitchRail = framed && (showGlitchRail ?? haloTone === "default");
  const imageClassName = cn(
    "relative z-[1] object-contain object-center",
    framed ? "h-full w-full rounded-full" : "h-full w-full",
  );
  const imageAlt = "Planner assistant sharing a colorful dashboard scene";
  const resolvedHeroImageSrc = withBasePath(heroImageSrc);
  const sharedImageProps = {
    decoding: "async" as const,
    sizes: imageSizes,
    className: imageClassName,
    ...(eager
      ? ({
          priority: true,
          loading: "eager" as const,
        } satisfies Pick<ComponentProps<typeof Image>, "priority" | "loading">)
      : {}),
  } satisfies Partial<ComponentProps<typeof Image>>;

  return (
    <figure
      className={cn(
        "relative z-10 flex w-full items-center justify-center",
        framed && "isolate aspect-square rounded-full",
        framed ? styles.framed : styles.frameless,
        framed ? (haloTone === "default" ? styles.toneDefault : styles.toneSubtle) : null,
        className,
      )}
    >
      {framed ? (
        <>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*2.3)] rounded-full opacity-[var(--welcome-figure-primary-opacity)] blur-[var(--welcome-figure-primary-blur)]",
              styles.haloPrimary,
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.6)] rounded-full opacity-[var(--welcome-figure-secondary-opacity)] blur-[var(--welcome-figure-secondary-blur)]",
              styles.haloSecondary,
            )}
          />
          {shouldShowGlitchRail ? (
            <span
              aria-hidden
              className="glitch-rail pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.05)] rounded-full mix-blend-screen opacity-[var(--welcome-figure-glitch-opacity)]"
            />
          ) : null}
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-full shadow-depth-soft ring-1 ring-border/50",
              styles.rim,
            )}
          >
            <div
              className={cn(
                "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full shadow-depth-inner",
                styles.inner,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-full",
                  styles.overlay,
                )}
              />
              <Image {...sharedImageProps} alt={imageAlt} src={resolvedHeroImageSrc} fill />
            </div>
          </div>
        </>
      ) : (
        <div className={styles.framelessWell}>
          <Image
            {...sharedImageProps}
            alt={imageAlt}
            src={resolvedHeroImageSrc}
            fill
          />
        </div>
      )}
    </figure>
  );
}
