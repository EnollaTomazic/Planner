"use client";

import * as React from "react";

import tokens from "../../tokens/tokens.js";
import { svgNumericFilters } from "@/lib/features";
import { tokensToFilter } from "@/lib/filter-tokens";
import { useOptionalTheme } from "@/lib/theme-context";

const gradientNoiseOpacityToken = tokens.gradientNoiseOpacity;
const gradientNoiseOpacityCssFallback = `var(--gradient-noise-opacity, ${gradientNoiseOpacityToken || "0.1"})`;

const filterValuesAreEqual = (
  a: ReturnType<typeof tokensToFilter>,
  b: ReturnType<typeof tokensToFilter>,
) =>
  a.slope === b.slope &&
  a.stdDeviation === b.stdDeviation &&
  a.table.length === b.table.length &&
  a.table.every((value, index) => value === b.table[index]);

interface RingNoiseDefsProps {
  id: string;
}

export default function RingNoiseDefs({ id }: RingNoiseDefsProps) {
  const themeContext = useOptionalTheme();
  const themeVariant = themeContext?.[0].variant;
  const themeBackground = themeContext?.[0].bg;
  const [filterValues, setFilterValues] = React.useState(tokensToFilter);

  React.useEffect(() => {
    if (!svgNumericFilters) {
      return;
    }

    const next = tokensToFilter();

    setFilterValues((prev) => (filterValuesAreEqual(prev, next) ? prev : next));
  }, [themeVariant, themeBackground]);

  const slopeValue = svgNumericFilters
    ? filterValues.slope
    : gradientNoiseOpacityCssFallback;

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
        <feFuncA type="linear" slope={slopeValue} />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="noiseAlpha" mode="soft-light" />
    </filter>
  );
}
