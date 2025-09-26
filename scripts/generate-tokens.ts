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

  const auroraLightFallbacks: Record<string, string> = {
    "aurora-g-light": "150 100% 85%",
    "aurora-g-light-color": "hsl(var(--aurora-g-light))",
    "aurora-p-light": "272 80% 85%",
    "aurora-p-light-color": "hsl(var(--aurora-p-light))",
  };

  for (const [name, value] of Object.entries(auroraLightFallbacks)) {
    colors[name] = { value };
  }

  for (const token of DEPRECATED_TOKENS) {
    delete colors[token];
  }

  const ensureToneForeground = (
    tone: "warning" | "success",
    fallback: string,
  ) => {
    const key = `${tone}-foreground`;
    if (!colors[key]) {
      colors[key] = { value: fallback };
    }
  };

  const darkForeground = "0 0% 6%";
  ensureToneForeground("warning", darkForeground);
  ensureToneForeground("success", darkForeground);

  const preservedVariables: Record<string, string> = {
    "pillar-wave-start": "var(--accent)",
    "pillar-wave-end": "var(--accent-2)",
    "pillar-wave-shadow": "var(--accent) / 0.35",
    "pillar-trading-start": "var(--lav-deep)",
    "pillar-trading-end": "var(--accent)",
    "pillar-trading-shadow": "var(--lav-deep) / 0.35",
    "pillar-vision-start": "var(--success)",
    "pillar-vision-end": "var(--accent-2)",
    "pillar-vision-shadow": "var(--success) / 0.35",
    "pillar-tempo-start": "var(--ring)",
    "pillar-tempo-end": "var(--accent)",
    "pillar-tempo-shadow": "var(--ring) / 0.35",
    "pillar-positioning-start": "var(--accent-2)",
    "pillar-positioning-end": "var(--primary)",
    "pillar-positioning-shadow": "var(--accent-2) / 0.35",
    "pillar-comms-start": "var(--lav-deep)",
    "pillar-comms-end": "var(--primary)",
    "pillar-comms-shadow": "var(--primary) / 0.35",
  };

  for (const [name, value] of Object.entries(preservedVariables)) {
    if (colors[name]) {
      colors[name] = { value };
    }
  }

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

  const tokensPath = path.resolve(__dirname, "../tokens/tokens.css");
  await applyAuroraColorMixOverrides(tokensPath);
}

buildTokens();

const AURORA_SUPPORT_BLOCK = `@supports (color: color-mix(in oklab, white, black)) {
  :root {
    --aurora-g-light: color-mix(in oklab, hsl(var(--accent-2)) 37.5%, white);
    --aurora-g-light-color: var(--aurora-g-light);
    --aurora-p-light: color-mix(in oklab, hsl(var(--accent)) 37.5%, white);
    --aurora-p-light-color: var(--aurora-p-light);
  }
}`;

const AURORA_SUPPORT_REGEX =
  /@supports \(color: color-mix\(in oklab, white, black\)\) {\s*:root {\s*[\s\S]*?}\s*}\s*/g;

async function readCssWithRetry(filePath: string): Promise<string> {
  const attempts = 5;
  for (let index = 0; index < attempts; index += 1) {
    const css = await fs.readFile(filePath, "utf8");
    if (css.trim().length > 0) {
      return css;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return fs.readFile(filePath, "utf8");
}

async function applyAuroraColorMixOverrides(filePath: string): Promise<void> {
  const css = await readCssWithRetry(filePath);
  const stripped = css.replace(AURORA_SUPPORT_REGEX, "").trimEnd();
  const baseCss = stripped.length > 0 ? stripped : css.trimEnd();
  const content = `${baseCss}\n\n${AURORA_SUPPORT_BLOCK}\n`;
  await fs.writeFile(filePath, content);
}
