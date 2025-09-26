const HSL_REGEX = /^(?<hue>-?\d+(?:\.\d+)?)\s+(?<saturation>\d+(?:\.\d+)?)%\s+(?<lightness>\d+(?:\.\d+)?)%\s*(?:\/.*)?$/;

interface HslComponents {
  h: number;
  s: number;
  l: number;
}

interface OklabColor {
  l: number;
  a: number;
  b: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeHue(hue: number): number {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function parseHsl(value: string): HslComponents | null {
  const match = value.trim().match(HSL_REGEX);
  if (!match || !match.groups) {
    return null;
  }

  const h = Number.parseFloat(match.groups["hue"] ?? "");
  const s = Number.parseFloat(match.groups["saturation"] ?? "");
  const l = Number.parseFloat(match.groups["lightness"] ?? "");

  if ([h, s, l].some((component) => Number.isNaN(component))) {
    return null;
  }

  return {
    h: normalizeHue(h),
    s: clamp(s / 100, 0, 1),
    l: clamp(l / 100, 0, 1),
  };
}

function hslToSrgb({ h, s, l }: HslComponents): [number, number, number] {
  if (s === 0) {
    return [l, l, l];
  }

  const hueSegment = h / 60;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((hueSegment % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (hueSegment >= 0 && hueSegment < 1) {
    r = chroma;
    g = x;
  } else if (hueSegment < 2) {
    r = x;
    g = chroma;
  } else if (hueSegment < 3) {
    g = chroma;
    b = x;
  } else if (hueSegment < 4) {
    g = x;
    b = chroma;
  } else if (hueSegment < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const m = l - chroma / 2;
  return [r + m, g + m, b + m];
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function srgbToOklab([r, g, b]: [number, number, number]): OklabColor {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6309787005 * bl;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

function oklabToSrgb(color: OklabColor): [number, number, number] {
  const l_ = Math.pow(color.l + 0.3963377774 * color.a + 0.2158037573 * color.b, 3);
  const m_ = Math.pow(color.l - 0.1055613458 * color.a - 0.0638541728 * color.b, 3);
  const s_ = Math.pow(color.l - 0.0894841775 * color.a - 1.291485548 * color.b, 3);

  const rl = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gl = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

  const r = clamp(linearToSrgb(rl), 0, 1);
  const g = clamp(linearToSrgb(gl), 0, 1);
  const b = clamp(linearToSrgb(bl), 0, 1);

  return [r, g, b];
}

function srgbToHsl(r: number, g: number, b: number): HslComponents {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }

  h = normalizeHue(h * 60);
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

function formatComponent(value: number, precision = 2): string {
  const rounded = Math.abs(value) < 1e-6 ? 0 : value;
  return rounded.toFixed(precision).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function mixHslWithWhiteInOklab(
  hslValue: string,
  percentage: number,
): string | null {
  if (percentage <= 0 || percentage >= 1) {
    return null;
  }

  const components = parseHsl(hslValue);
  if (!components) {
    return null;
  }

  const srgb = hslToSrgb(components);
  const lab = srgbToOklab(srgb);

  const weight = clamp(percentage, 0, 1);
  const mixed: OklabColor = {
    l: lab.l * weight + (1 - weight) * 1,
    a: lab.a * weight,
    b: lab.b * weight,
  };

  const [r, g, b] = oklabToSrgb(mixed);
  const hsl = srgbToHsl(r, g, b);

  return `${formatComponent(hsl.h, 1)} ${formatComponent(hsl.s * 100)}% ${formatComponent(
    hsl.l * 100,
  )}%`;
}

