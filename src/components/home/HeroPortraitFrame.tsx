import * as React from "react";
import Image from "next/image";
import { cn, withBasePath } from "@/lib/utils";

export interface HeroPortraitFrameProps {
  imageSrc: string;
  imageAlt: string;
  imageSizes?: string;
  priority?: boolean;
  className?: string;
  frame?: boolean;
}

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string>;

const frameVariables: CSSVarStyle = {
  "--portrait-size":
    "clamp(calc(var(--space-7) + var(--space-1)), calc(var(--space-7) + var(--space-1) + 4vw), calc(var(--space-8) + var(--space-4)))",
  "--portrait-rim": "calc(var(--space-2) / 2)",
  "--portrait-glow": "calc(var(--space-4) + var(--space-1))",
  "--portrait-rim-gradient":
    "conic-gradient(from 140deg at 50% 50%, hsl(var(--accent) / 0.88), hsl(var(--accent-2) / 0.9), hsl(var(--ring) / 0.85), hsl(var(--accent) / 0.88))",
  "--portrait-surface": "hsl(var(--card) / 0.92)",
  "--portrait-outline": "0 0 0 var(--hairline-w) hsl(var(--card-hairline) / 0.65)",
  "--portrait-glow-gradient":
    "radial-gradient(circle at 50% 32%, hsl(var(--lav-deep) / 0.55), transparent 70%)",
};

const rimStyle: React.CSSProperties = {
  width: "calc(var(--portrait-size) + var(--portrait-rim) * 2)",
  height: "calc(var(--portrait-size) + var(--portrait-rim) * 2)",
  padding: "var(--portrait-rim)",
  background: "var(--portrait-rim-gradient)",
};

const innerStyle: React.CSSProperties = {
  width: "var(--portrait-size)",
  height: "var(--portrait-size)",
  background: "var(--portrait-surface)",
  boxShadow: "var(--portrait-outline)",
};

const framelessContainerStyle: CSSVarStyle = {
  ...frameVariables,
  width: innerStyle.width,
  height: innerStyle.height,
  background: innerStyle.background,
  boxShadow: innerStyle.boxShadow,
};

const glowStyle: React.CSSProperties = {
  background: "var(--portrait-glow-gradient)",
};

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
          "overflow-hidden rounded-full shadow-neo",
          className,
        )}
        style={framelessContainerStyle}
      >
        {portraitImage}
      </div>
    );
  }

  return (
    <div className={cn(baseClassName, className)} style={frameVariables}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.6)] rounded-full blur-[var(--portrait-glow)] opacity-80"
        style={glowStyle}
      />
      <span
        aria-hidden
        className="glitch-rail pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.1)] rounded-full mix-blend-screen opacity-70"
      />
      <div
        className="relative flex items-center justify-center rounded-full shadow-neo"
        style={rimStyle}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-full"
          style={innerStyle}
        >
          {portraitImage}
        </div>
      </div>
    </div>
  );
}
