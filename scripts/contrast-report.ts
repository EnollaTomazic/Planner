import "./check-node-version.js";
import fs from "node:fs/promises";
import path from "node:path";
import tokens from "../tokens/tokens.js";

interface Row {
  surface: string;
  foreground: string;
  previous: string;
  current: string;
  aa: "pass" | "fail";
}

function parseHsl(value: string): { h: number; s: number; l: number } | null {
  const m = value.match(
    /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/,
  );
  if (!m) return null;
  return {
    h: parseFloat(m[1]),
    s: parseFloat(m[2]) / 100,
    l: parseFloat(m[3]) / 100,
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hh >= 0 && hh < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (hh < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (hh < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (hh < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (hh < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  const m = l - c / 2;
  return [r1 + m, g1 + m, b1 + m];
}

function luminance(r: number, g: number, b: number): number {
  const rgb = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(l1: number, l2: number): number {
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (a + 0.05) / (b + 0.05);
}

const surfaceRe = /(background|surface|card|panel)/i;
const foregroundRe = /(foreground|text)/i;

const surfaces = Object.entries(tokens).filter(
  ([name, value]) => surfaceRe.test(name) && parseHsl(value),
);
const excludedForegrounds = new Set(["warningForeground", "successForeground"]);

const foregrounds = Object.entries(tokens).filter(
  ([name, value]) =>
    foregroundRe.test(name) &&
    parseHsl(value) &&
    !excludedForegrounds.has(name),
);

const reportPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../docs/color-contrast-report.md",
);
const previous: Record<string, string> = {};
try {
  const md = await fs.readFile(reportPath, "utf8");
  const lines = md.split(/\r?\n/).slice(2);
  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length >= 5) {
      const key = `${parts[1]}-${parts[2]}`;
      previous[key] = parts[4];
    }
  }
} catch {
  // no previous report
}

const rows: Row[] = [];
for (const [sName, sVal] of surfaces) {
  const sHsl = parseHsl(sVal as string);
  if (!sHsl) continue;
  const sLum = luminance(...hslToRgb(sHsl.h, sHsl.s, sHsl.l));
  for (const [fName, fVal] of foregrounds) {
    const fHsl = parseHsl(fVal as string);
    if (!fHsl) continue;
    const fLum = luminance(...hslToRgb(fHsl.h, fHsl.s, fHsl.l));
    const ratio = contrast(fLum, sLum);
    const key = `${sName}-${fName}`;
    rows.push({
      surface: sName,
      foreground: fName,
      previous: previous[key] ?? "n/a",
      current: ratio.toFixed(2),
      aa: ratio >= 4.5 ? "pass" : "fail",
    });
  }
}

const tonePairs: Array<[string, string]> = [
  ["warning", "warningForeground"],
  ["success", "successForeground"],
];

for (const [surfaceName, foregroundName] of tonePairs) {
  const surfaceValue = tokens[surfaceName];
  const foregroundValue = tokens[foregroundName];
  if (!surfaceValue || !foregroundValue) continue;
  const surfaceHsl = parseHsl(surfaceValue);
  const foregroundHsl = parseHsl(foregroundValue);
  if (!surfaceHsl || !foregroundHsl) continue;
  const surfaceLum = luminance(
    ...hslToRgb(surfaceHsl.h, surfaceHsl.s, surfaceHsl.l),
  );
  const foregroundLum = luminance(
    ...hslToRgb(foregroundHsl.h, foregroundHsl.s, foregroundHsl.l),
  );
  const ratio = contrast(foregroundLum, surfaceLum).toFixed(2);
  const key = `${surfaceName}-${foregroundName}`;
  rows.push({
    surface: surfaceName,
    foreground: foregroundName,
    previous: previous[key] ?? "n/a",
    current: ratio,
    aa: parseFloat(ratio) >= 4.5 ? "pass" : "fail",
  });
}

rows.sort((a, b) =>
  a.surface === b.surface
    ? a.foreground.localeCompare(b.foreground)
    : a.surface.localeCompare(b.surface),
);

const lines = [
  "# Color Contrast Report",
  "",
  "| Surface | Foreground | Previous | Current | AA |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map(
    (r) =>
      `| ${r.surface} | ${r.foreground} | ${r.previous} | ${r.current} | ${r.aa} |`,
  ),
];

await fs.writeFile(reportPath, lines.join("\n") + "\n");

console.log(`Wrote ${rows.length} contrast pairs to ${reportPath}`);
