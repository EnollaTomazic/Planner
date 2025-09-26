// src/lib/color.ts
// Utilities for working with design tokens that store raw HSL channel values.
// Many server contexts (Next.js icon/font metadata) cannot resolve CSS custom
// properties, so we need concrete color strings. These helpers convert our
// `"h s% l%"` token convention to hex colors while leaving derived tokens
// (those referencing other variables or calculations) untouched.

const HSL_TOKEN_PATTERN =
  /^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const channelToHex = (value: number): string =>
  Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");

const hueToRgb = (p: number, q: number, t: number): number => {
  let temp = t;
  if (temp < 0) temp += 1;
  if (temp > 1) temp -= 1;
  if (temp < 1 / 6) return p + (q - p) * 6 * temp;
  if (temp < 1 / 2) return q;
  if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
  return p;
};

/**
 * Convert a raw HSL token value ("247 34% 6%") into a hex color string.
 * Values that reference other tokens (contain `var(`, `calc(`, `/`, or commas)
 * are returned unchanged so callers can fall back to CSS variables.
 */
export function tokenToHexColor(token: string): string {
  const value = token.trim();

  if (
    value.includes("var(") ||
    value.includes("calc(") ||
    value.includes("/") ||
    value.includes(",")
  ) {
    return value;
  }

  const match = value.match(HSL_TOKEN_PATTERN);
  if (!match) {
    return value;
  }

  const hue = ((parseFloat(match[1]) % 360) + 360) % 360;
  const saturation = clamp(parseFloat(match[2]) / 100, 0, 1);
  const lightness = clamp(parseFloat(match[3]) / 100, 0, 1);

  if (saturation === 0) {
    const gray = channelToHex(lightness * 255);
    return `#${gray}${gray}${gray}`;
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  const r = hueToRgb(p, q, hue / 360 + 1 / 3);
  const g = hueToRgb(p, q, hue / 360);
  const b = hueToRgb(p, q, hue / 360 - 1 / 3);

  return `#${channelToHex(r * 255)}${channelToHex(g * 255)}${channelToHex(
    b * 255,
  )}`;
}

/**
 * Resolve a token to a CSS color. Hex strings remain hex, while raw HSL values
 * are converted. Derived tokens are returned unchanged so they can cascade to
 * the browser where CSS custom properties are available.
 */
export function resolveTokenColor(token: string): string {
  const trimmed = token.trim();

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  const hexCandidate = tokenToHexColor(trimmed);
  return hexCandidate;
}

