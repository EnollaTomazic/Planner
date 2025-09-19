import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string>;

const figureVariables: CSSVarStyle = {
  "--welcome-figure-rim": "calc(var(--space-2) / 1.4)",
  "--welcome-figure-glow": "calc(var(--space-5) + var(--space-1))",
  "--welcome-figure-rim-gradient":
    "conic-gradient(from 125deg at 50% 50%, hsl(var(--accent) / 0.92), hsl(var(--accent-2) / 0.88), hsl(var(--ring) / 0.85), hsl(var(--accent) / 0.92))",
  "--welcome-figure-surface": "hsl(var(--card) / 0.95)",
  "--welcome-figure-inner": "hsl(var(--surface) / 0.88)",
  "--welcome-figure-outline": "0 0 0 var(--hairline-w) hsl(var(--card-hairline) / 0.65)",
  "--welcome-figure-primary-halo":
    "radial-gradient(circle at 52% 36%, hsl(var(--accent-2) / 0.5), transparent 72%)",
  "--welcome-figure-secondary-halo":
    "radial-gradient(circle at 34% 70%, hsl(var(--accent) / 0.32), transparent 78%)",
};

const rimStyle: React.CSSProperties = {
  padding: "var(--welcome-figure-rim)",
  background: "var(--welcome-figure-rim-gradient)",
};

const innerStyle: React.CSSProperties = {
  background: "var(--welcome-figure-surface)",
  boxShadow: "var(--welcome-figure-outline)",
};

const overlayStyle: React.CSSProperties = {
  background: "var(--welcome-figure-inner)",
};

const haloPrimaryStyle: React.CSSProperties = {
  background: "var(--welcome-figure-primary-halo)",
};

const haloSecondaryStyle: React.CSSProperties = {
  background: "var(--welcome-figure-secondary-halo)",
};

const defaultSizes =
  "(max-width: 767px) 100vw, (max-width: 1023px) calc(100vw / 3), calc(100vw * 5 / 12)";

export interface WelcomeHeroFigureProps {
  className?: string;
  imageSizes?: string;
}

export default function WelcomeHeroFigure({
  className,
  imageSizes = defaultSizes,
}: WelcomeHeroFigureProps) {
  return (
    <figure
      className={cn(
        "relative z-10 isolate flex aspect-square w-full items-center justify-center",
        "rounded-full",
        className,
      )}
      style={figureVariables}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*2.3)] rounded-full opacity-80 blur-[var(--welcome-figure-glow)]"
        style={haloPrimaryStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.6)] rounded-full opacity-70 blur-[calc(var(--welcome-figure-glow)*0.75)]"
        style={haloSecondaryStyle}
      />
      <span
        aria-hidden
        className="glitch-rail pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.05)] rounded-full mix-blend-screen opacity-75"
      />
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full shadow-neoSoft ring-1 ring-border/50"
        style={rimStyle}
      >
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full shadow-neo-inset"
          style={innerStyle}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={overlayStyle}
          />
          <Image
            src="/BEST_ONE_EVAH.png"
            alt="Planner assistant sharing a colorful dashboard scene"
            fill
            priority
            loading="eager"
            decoding="async"
            sizes={imageSizes}
            className="relative z-[1] h-full w-full object-contain object-center"
          />
        </div>
      </div>
    </figure>
  );
}
