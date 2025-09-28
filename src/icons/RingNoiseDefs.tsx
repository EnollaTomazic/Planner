import * as React from "react";

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
        <feFuncA type="linear" slope="var(--gradient-noise-opacity, 0.1)" />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="noiseAlpha" mode="soft-light" />
    </filter>
  );
}
