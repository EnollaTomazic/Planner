const rawSvgNumericFilters = process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;
const rawDepthTheme = process.env.NEXT_PUBLIC_DEPTH_THEME;

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

export { depthThemeEnabled, svgNumericFilters };
