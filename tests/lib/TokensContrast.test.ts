import { describe, it, expect } from "vitest";
import tokens from "../../tokens/tokens.js";

type Hsl = {
  h: number;
  s: number;
  l: number;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

function parseHsl(value: string): Hsl {
  const [hue, saturation, lightness] = value.trim().split(/\s+/);
  return {
    h: Number.parseFloat(hue),
    s: Number.parseFloat(saturation.replace("%", "")),
    l: Number.parseFloat(lightness.replace("%", "")),
  };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = h / 360;
  const saturation = s / 100;
  const light = l / 100;

  if (saturation === 0) {
    return { r: light, g: light, b: light };
  }

  const q = light < 0.5 ? light * (1 + saturation) : light + saturation - light * saturation;
  const p = 2 * light - q;

  const hue2rgb = (t: number): number => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  return {
    r: hue2rgb(hue + 1 / 3),
    g: hue2rgb(hue),
    b: hue2rgb(hue - 1 / 3),
  };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const transform = (channel: number): number =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

  const [rLin, gLin, bLin] = [r, g, b].map(transform);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(color: Rgb, against: Rgb): number {
  const l1 = relativeLuminance(color);
  const l2 = relativeLuminance(against);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("accent token contrast", () => {
  const white: Rgb = { r: 1, g: 1, b: 1 };

  it("keeps the accent gradient readable against white text", () => {
    const accent = hslToRgb(parseHsl(tokens.accent));
    const accent2 = hslToRgb(parseHsl(tokens.accent2));

    expect(contrastRatio(accent, white)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent2, white)).toBeGreaterThanOrEqual(4.5);
  });
});
