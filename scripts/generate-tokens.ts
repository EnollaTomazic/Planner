import "./check-node-version.js";
import StyleDictionary from "style-dictionary";
import type {
  FormatFnArguments,
  TransformedToken,
} from "style-dictionary/types";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spacingTokens, radiusScale } from "../src/lib/tokens.ts";
import { createProgressBar, stopBars } from "../src/utils/progress.ts";
import { mixHslWithWhiteInOklab } from "./utils/color.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPRECATED_TOKENS = new Set([
  "shadow-glow-small",
  "shadow-glow-strong",
]);

const isDeprecatedToken = (name: string): boolean =>
  DEPRECATED_TOKENS.has(name);

StyleDictionary.registerFormat({
  name: "tokens/markdown",
  format: ({ dictionary }: FormatFnArguments): string => {
    const lines = dictionary.allTokens.map(
      (t: TransformedToken) => `| ${t.name} | ${t.value} |`,
    );
    return ["| Token | Value |", "| --- | --- |", ...lines].join("\n");
  },
});

async function loadBaseColors(): Promise<Record<string, { value: string }>> {
  const tokensPath = path.resolve(__dirname, "../tokens/tokens.css");
  const css = await fs.readFile(tokensPath, "utf8");
  const colorRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  const colors: Record<string, { value: string }> = {};
  let match: RegExpExecArray | null;
  while ((match = colorRegex.exec(css))) {
    const name = match[1];
    if (
      name.startsWith("spacing-") ||
      name.startsWith("radius-") ||
      isDeprecatedToken(name)
    ) {
      continue;
    }
    colors[name] = { value: match[2].trim() };
  }
  return colors;
}

const AURORA_LIGHT_RATIO = 0.375;

function applyAuroraFallbacks(
  colors: Record<string, { value: string }>,
): void {
  const accentValue = colors["accent"]?.value ?? "";
  const accent2Value = colors["accent-2"]?.value ?? "";

  const gFallback = mixHslWithWhiteInOklab(accent2Value, AURORA_LIGHT_RATIO);
  const pFallback = mixHslWithWhiteInOklab(accentValue, AURORA_LIGHT_RATIO);

  if (gFallback) {
    colors["aurora-g-light"] = { value: gFallback };
  }

  if (pFallback) {
    colors["aurora-p-light"] = { value: pFallback };
  }
}

async function appendAuroraSupportsBlock(): Promise<void> {
  const tokensPath = path.resolve(__dirname, "../tokens/tokens.css");
  let css = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    css = await fs.readFile(tokensPath, "utf8");
    if (css.length > 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  if (css.length === 0) {
    throw new Error("tokens.css was empty after generation");
  }
  const marker = "@supports (color: color-mix(in oklab, white, black)) {";
  const supportIndex = css.indexOf(marker);
  const baseCss = supportIndex === -1 ? css : css.slice(0, supportIndex);
  const trimmed = baseCss.trimEnd();
  const supportsBlock = [
    "@supports (color: color-mix(in oklab, white, black)) {",
    "  :root {",
    "    --aurora-g-light: color-mix(in oklab, hsl(var(--accent-2)) 37.5%, white);",
    "    --aurora-p-light: color-mix(in oklab, hsl(var(--accent)) 37.5%, white);",
    "  }",
    "}",
    "",
  ].join("\n");

  await fs.writeFile(tokensPath, `${trimmed}\n\n${supportsBlock}`);
}

async function buildTokens(): Promise<void> {
  const spacing = spacingTokens.reduce<Record<string, { value: string }>>(
    (acc, val, idx) => {
      acc[idx + 1] = { value: `${val}px` };
      return acc;
    },
    {},
  );
  const derivedSpacing: Record<string, { value: string }> = {
    "spacing-0-125": { value: "calc(var(--spacing-1) / 8)" },
    "spacing-0-25": { value: "calc(var(--spacing-1) / 4)" },
    "spacing-0-5": { value: "calc(var(--spacing-1) / 2)" },
    "spacing-0-75": { value: "calc(var(--spacing-1) * 0.75)" },
  };
  const radius = Object.entries(radiusScale).reduce<
    Record<string, { value: string }>
  >((acc, [name, value]) => {
    acc[name] = { value: `${value}px` };
    return acc;
  }, {});

  const colorRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  const colors: Record<string, { value: string }> = await loadBaseColors();
  const themePath = path.resolve(__dirname, "../src/app/themes.css");
  const themeCss = await fs.readFile(themePath, "utf8");
  const themeRoot = themeCss.match(/:root\s*{([^}]*)}/);
  const themeBase = themeRoot ? themeRoot[1] : themeCss;
  let match: RegExpExecArray | null;
  while ((match = colorRegex.exec(themeBase))) {
    const name = match[1];
    if (name.startsWith("radius-") || isDeprecatedToken(name)) continue;
    colors[name] = { value: match[2].trim() };
  }
  const globalsPath = path.resolve(__dirname, "../src/app/globals.css");
  const globalsCss = await fs.readFile(globalsPath, "utf8");
  const glowTokens = ["--glow-strong", "--glow-soft"];
  for (const token of glowTokens) {
    const regex = new RegExp(`${token}:\\s*([^;]+);`);
    const m = globalsCss.match(regex);
    if (m) {
      const name = token.replace(/^--/, "");
      if (isDeprecatedToken(name)) {
        continue;
      }
      colors[name] = { value: m[1].trim() };
    }
  }

  for (const token of DEPRECATED_TOKENS) {
    delete colors[token];
  }

  applyAuroraFallbacks(colors);

  const sd = new StyleDictionary({
    tokens: { ...colors, ...derivedSpacing, spacing, radius },
    platforms: {
      css: {
        transforms: ["name/kebab"],
        buildPath: "tokens/",
        files: [{ destination: "tokens.css", format: "css/variables" }],
      },
      js: {
        transforms: ["name/camel"],
        buildPath: "tokens/",
        files: [
          {
            destination: "tokens.js",
            format: "javascript/esm",
            options: { flat: true },
          },
        ],
      },
      docs: {
        transforms: ["name/kebab"],
        buildPath: "docs/",
        files: [{ destination: "tokens.md", format: "tokens/markdown" }],
      },
    },
  });

  const bar = createProgressBar(3);
  sd.buildPlatform("css");
  bar.update(1);
  sd.buildPlatform("js");
  bar.update(2);
  sd.buildPlatform("docs");
  bar.update(3);
  stopBars();

  await appendAuroraSupportsBlock();
}

buildTokens();
