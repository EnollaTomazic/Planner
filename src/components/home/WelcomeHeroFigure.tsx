import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string>;

type WelcomeHeroFigureTone = "default" | "subtle";

const figureBaseVariables: CSSVarStyle = {
  "--welcome-figure-rim": "calc(var(--space-2) / 1.4)",
  "--welcome-figure-rim-gradient":
    "conic-gradient(from 125deg at 50% 50%, hsl(var(--accent) / 0.92), hsl(var(--accent-2) / 0.88), hsl(var(--ring) / 0.85), hsl(var(--accent) / 0.92))",
  "--welcome-figure-surface": "hsl(var(--card) / 0.95)",
  "--welcome-figure-inner": "hsl(var(--surface) / 0.88)",
  "--welcome-figure-outline": "0 0 0 var(--hairline-w) hsl(var(--card-hairline) / 0.65)",
};

const haloToneVariables: Record<WelcomeHeroFigureTone, CSSVarStyle> = {
  default: {
    "--welcome-figure-glow": "calc(var(--space-4) + var(--space-1))",
    "--welcome-figure-primary-halo":
      "radial-gradient(circle at 52% 36%, hsl(var(--accent-2) / 0.34), transparent 68%)",
    "--welcome-figure-secondary-halo":
      "radial-gradient(circle at 34% 70%, hsl(var(--accent) / 0.28), transparent 74%)",
    "--welcome-figure-primary-opacity": "0.35",
    "--welcome-figure-secondary-opacity": "0.3",
    "--welcome-figure-primary-blur": "calc(var(--welcome-figure-glow) * 0.85)",
    "--welcome-figure-secondary-blur": "calc(var(--welcome-figure-glow) * 0.6)",
    "--welcome-figure-glitch-opacity": "0.36",
  },
  subtle: {
    "--welcome-figure-glow": "calc(var(--space-3) + var(--space-1))",
    "--welcome-figure-primary-halo":
      "radial-gradient(circle at 52% 36%, hsl(var(--accent-2) / 0.28), transparent 64%)",
    "--welcome-figure-secondary-halo":
      "radial-gradient(circle at 34% 70%, hsl(var(--accent) / 0.22), transparent 70%)",
    "--welcome-figure-primary-opacity": "0.3",
    "--welcome-figure-secondary-opacity": "0.26",
    "--welcome-figure-primary-blur": "calc(var(--welcome-figure-glow) * 0.7)",
    "--welcome-figure-secondary-blur": "calc(var(--welcome-figure-glow) * 0.5)",
    "--welcome-figure-glitch-opacity": "0.18",
  },
};

const defaultFigureVariables: CSSVarStyle = {
  ...figureBaseVariables,
  ...haloToneVariables.default,
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
  haloTone?: WelcomeHeroFigureTone;
  showGlitchRail?: boolean;
  framed?: boolean;
}

export default function WelcomeHeroFigure({
  className,
  imageSizes = defaultSizes,
  haloTone = "default",
  showGlitchRail,
  framed = true,
}: WelcomeHeroFigureProps) {
  const toneVariables = haloToneVariables[haloTone];
  const shouldShowGlitchRail = showGlitchRail ?? haloTone === "default";
  const image = (
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
  );

  return (
    <figure
      className={cn(
        "relative z-10 isolate flex aspect-square w-full items-center justify-center",
        "rounded-full",
        className,
      )}
      style={{ ...defaultFigureVariables, ...toneVariables }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*2.3)] rounded-full opacity-[var(--welcome-figure-primary-opacity)] blur-[var(--welcome-figure-primary-blur)]"
        style={haloPrimaryStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.6)] rounded-full opacity-[var(--welcome-figure-secondary-opacity)] blur-[var(--welcome-figure-secondary-blur)]"
        style={haloSecondaryStyle}
      />
      {shouldShowGlitchRail ? (
        <span
          aria-hidden
          className="glitch-rail pointer-events-none absolute -inset-[calc(var(--welcome-figure-rim)*1.05)] rounded-full mix-blend-screen opacity-[var(--welcome-figure-glitch-opacity)]"
        />
      ) : null}
      {framed ? (
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
            {image}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          {image}
        </div>
      )}
    </figure>
  );
}
