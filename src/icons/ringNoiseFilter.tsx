import * as React from "react";

interface RingNoiseFilterDefinition {
  readonly filterId: string;
  readonly element: React.ReactNode;
}

export function renderRingNoiseFilter(uniqueId: string): RingNoiseFilterDefinition {
  const filterId = `ring-noise-filter-${uniqueId}`;

  return {
    filterId,
    element: (
      <filter
        id={filterId}
        x="-0.2"
        y="-0.2"
        width="1.4"
        height="1.4"
        filterUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          seed="7"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3333 0.3333 0.3333 0 0"
          result="noiseAlpha"
        />
        <feComponentTransfer in="noiseAlpha" result="softNoise">
          <feFuncA type="linear" slope="0.6" intercept="0.1" />
        </feComponentTransfer>
        <feFlood
          floodColor="hsl(var(--accent))"
          floodOpacity="var(--gradient-noise-opacity, 0.1)"
          result="accentTint"
        />
        <feFlood
          floodColor="hsl(var(--accent-2))"
          floodOpacity="var(--gradient-noise-opacity, 0.1)"
          result="accentSecondTint"
        />
        <feBlend in="accentTint" in2="accentSecondTint" mode="screen" result="dualAccent" />
        <feComposite in="dualAccent" in2="softNoise" operator="in" result="tintedNoise" />
        <feBlend in="SourceGraphic" in2="tintedNoise" mode="overlay" />
      </filter>
    ),
  };
}
