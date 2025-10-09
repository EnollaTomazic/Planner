import { readClientEnv } from "./load-client-env";

const {
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: rawSvgNumericFilters,
  NEXT_PUBLIC_DEPTH_THEME: rawDepthTheme,
  NEXT_PUBLIC_ORGANIC_DEPTH: rawOrganicDepth,
  NEXT_PUBLIC_FEATURE_GLITCH_LANDING: rawFeatureGlitchLanding,
  NEXT_PUBLIC_UI_GLITCH_LANDING: rawLegacyGlitchLanding,
  NEXT_PUBLIC_SAFE_MODE: rawSafeMode,
} = readClientEnv();

const enabledValues = new Set(["1", "true", "on", "yes"]);
const disabledValues = new Set(["0", "false", "off", "no"]);

function parseBooleanFlag(raw: string | undefined, fallback: boolean): boolean {
  if (typeof raw !== "string") {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();

  if (enabledValues.has(normalized)) {
    return true;
  }

  if (disabledValues.has(normalized)) {
    return false;
  }

  return fallback;
}

const svgNumericFilters = parseBooleanFlag(rawSvgNumericFilters, true);
const depthThemeEnabled = parseBooleanFlag(rawDepthTheme, false);
const organicDepthEnabled = parseBooleanFlag(rawOrganicDepth, false);
const glitchLandingRaw =
  rawFeatureGlitchLanding !== undefined
    ? rawFeatureGlitchLanding
    : rawLegacyGlitchLanding;
const glitchLandingEnabled = parseBooleanFlag(glitchLandingRaw, true);
const safeModeEnabled = parseBooleanFlag(rawSafeMode, false);

export function isSafeModeEnabled(): boolean {
  return safeModeEnabled;
}

export {
  depthThemeEnabled,
  glitchLandingEnabled,
  organicDepthEnabled,
  safeModeEnabled,
  svgNumericFilters,
};
