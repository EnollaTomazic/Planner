import { env } from "@/env/client";

const svgNumericFilters: boolean = env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;
const depthThemeEnabled: boolean = env.NEXT_PUBLIC_DEPTH_THEME;
const organicDepthEnabled: boolean = env.NEXT_PUBLIC_ORGANIC_DEPTH;
const glitchLandingEnabled: boolean = env.NEXT_PUBLIC_UI_GLITCH_LANDING;

export {
  depthThemeEnabled,
  glitchLandingEnabled,
  organicDepthEnabled,
  svgNumericFilters,
};
