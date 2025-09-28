const rawSvgNumericFilters = process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;

const enabledSvgNumericFilterValues = new Set(["1", "true", "on", "yes"]);
const disabledSvgNumericFilterValues = new Set(["0", "false", "off", "no"]);

const svgNumericFilters: boolean = (() => {
  if (typeof rawSvgNumericFilters !== "string") {
    return true;
  }

  const normalized = rawSvgNumericFilters.trim().toLowerCase();

  if (enabledSvgNumericFilterValues.has(normalized)) {
    return true;
  }

  if (disabledSvgNumericFilterValues.has(normalized)) {
    return false;
  }

  return true;
})();

export { svgNumericFilters };
