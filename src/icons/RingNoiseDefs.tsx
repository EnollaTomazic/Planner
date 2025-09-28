import * as React from "react";

import tokens from "../../tokens/tokens.js";
import { svgNumericFilters } from "@/lib/features";

const gradientNoiseOpacityToken = tokens.gradientNoiseOpacity;
const parsedGradientNoiseOpacity = Number.parseFloat(gradientNoiseOpacityToken);
const gradientNoiseOpacity = Number.isFinite(parsedGradientNoiseOpacity)
  ? parsedGradientNoiseOpacity
  : 0.1;
const gradientNoiseOpacityCssFallback = `var(--gradient-noise-opacity, ${gradientNoiseOpacityToken || "0.1"})`;
const gradientNoiseOpacityValue = svgNumericFilters
  ? gradientNoiseOpacity
  : gradientNoiseOpacityCssFallback;

interface RingNoiseDefsProps {
  id: string;
}

export default function RingNoiseDefs({ id }: RingNoiseDefsProps) {
  return (
    <filter
      id={id}
      x="-15%"
      y="-15%"
      width="130%"
      height="130%"
      filterUnits="objectBoundingBox"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="1.1"
        numOctaves="3"
        seed="4"
        result="noise"
      />
      <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
      <feComponentTransfer in="monoNoise" result="noiseAlpha">
        <feFuncA type="linear" slope={gradientNoiseOpacityValue} />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="noiseAlpha" mode="soft-light" />
    </filter>
  );
}
