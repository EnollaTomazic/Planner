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
  "progress-ring-diameter",
  "progress-ring-stroke",
  "progress-ring-inset",
  "timer-ring-diameter",
  "timer-ring-stroke",
  "timer-ring-inset",
]);

const REQUIRED_THEME_TOKEN_GROUPS = {
  depth: [
    "neo-depth-sm",
    "neo-depth-md",
    "neo-depth-lg",
    "neo-surface",
    "neo-surface-alt",
    "neo-highlight",
    "depth-shadow-outer",
    "depth-shadow-outer-strong",
    "depth-shadow-soft",
    "depth-shadow-inner",
    "shadow-outer-sm",
    "shadow-outer-md",
    "shadow-outer-lg",
    "shadow-inner-sm",
    "shadow-inner-md",
    "shadow-inner-lg",
    "depth-glow-highlight-soft",
    "depth-glow-highlight-medium",
    "depth-glow-highlight-strong",
    "depth-glow-shadow-soft",
    "depth-glow-shadow-medium",
    "depth-glow-shadow-strong",
    "depth-focus-ring-rest",
    "depth-focus-ring-active",
    "glow-ring-sm",
    "glow-ring-md",
    "shadow-outer-xl",
    "glow-ring",
    "card-elev-1",
    "card-elev-2",
    "card-elev-3",
  ],
  organicBackdrop: [
    "backdrop-blob-1",
    "backdrop-blob-2",
    "backdrop-blob-3",
    "backdrop-blob-shadow",
    "backdrop-grid-primary",
    "backdrop-grid-secondary",
    "backdrop-grid-opacity",
    "backdrop-drip-1",
    "backdrop-drip-2",
    "backdrop-drip-3",
    "backdrop-drip-shadow",
    "blob-surface",
    "blob-surface-1",
    "blob-surface-2",
    "blob-surface-3",
    "blob-surface-shadow",
    "drip-surface",
    "blob-radius-soft",
    "gradient-blob-primary",
  ],
  glitch: [
    "neo-glow-strength",
    "neon-outline-opacity",
    "glitch-intensity-default",
    "glitch-intensity-subtle",
    "glitch-intensity",
    "glitch-duration",
    "glitch-fringe",
    "glitch-static-opacity",
    "glitch-noise-level",
    "glitch-overlay-opacity-card",
    "glitch-overlay-button-opacity",
    "glitch-overlay-button-opacity-reduced",
    "glitch-chromatic-offset-strong",
    "glitch-chromatic-offset-medium",
    "glitch-chromatic-offset-light",
    "glitch-halo-opacity",
    "glitch-ring-color",
    "glitch-ring-blur",
    "glitch-ring-shadow",
    "glitch-accent-color",
    "glitch-accent-blur",
    "glitch-accent-shadow",
    "glitch-noise-primary",
    "glitch-noise-secondary",
    "glitch-noise-contrast",
    "glitch-noise-hover",
    "gradient-glitch-primary",
  ],
  motion: [
    "glitch-scanline",
    "glitch-rgb-shift",
    "glow-pulse",
  ],
} as const;

const isDeprecatedToken = (name: string): boolean =>
  DEPRECATED_TOKENS.has(name);

function assertRequiredThemeTokens(
  palette: Record<string, { value: string }>,
): void {
  const missingByGroup = Object.entries(REQUIRED_THEME_TOKEN_GROUPS).flatMap(
    ([group, tokens]) =>
      tokens
        .filter((token) => !palette[token])
        .map((token) => `${group}: ${token}`),
  );

  if (missingByGroup.length > 0) {
    throw new Error(
      [
        "Missing theme token coverage for:",
        ...missingByGroup.map((entry) => `- ${entry}`),
        "Update src/app/themes.css or scripts/generate-tokens.ts to keep the token pipeline in sync.",
      ].join("\n"),
    );
  }
}

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

function stripSupportsBlocks(css: string): string {
  let result = "";
  for (let index = 0; index < css.length; ) {
    if (css.startsWith("@supports", index)) {
      const openIndex = css.indexOf("{", index);
      if (openIndex === -1) {
        result += css.slice(index);
        break;
      }
      let depth = 0;
      let cursor = openIndex;
      while (cursor < css.length) {
        const char = css[cursor];
        if (char === "{") {
          depth += 1;
        } else if (char === "}") {
          depth -= 1;
          if (depth === 0) {
            cursor += 1;
            break;
          }
        }
        cursor += 1;
      }
      index = cursor;
    } else {
      result += css[index];
      index += 1;
    }
  }
  return result;
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
  const spaceAliases = spacingTokens.reduce<Record<string, { value: string }>>(
    (acc, _value, idx) => {
      const step = idx + 1;
      acc[`space-${step}`] = { value: `var(--spacing-${step})` };
      return acc;
    },
    {},
  );
  const extendedSpace: Record<string, { value: string }> = {
    "space-9": { value: "calc(var(--space-8) + var(--space-1))" },
    "space-10": { value: "calc(var(--space-8) + var(--space-2))" },
    "space-11": { value: "calc(var(--space-8) + var(--space-3))" },
    "space-12": { value: "calc(var(--space-8) + var(--space-4))" },
    "space-16": { value: "calc(var(--space-8) * 2)" },
  };
  const ringTokens: Record<string, { value: string }> = {
    "ring-size-1": { value: "var(--spacing-0-5)" },
    "ring-size-2": { value: "var(--spacing-1)" },
  };
  const iconStrokeTokens: Record<string, { value: string }> = {
    "icon-stroke-100": { value: "var(--spacing-0-5)" },
    "icon-stroke-150": { value: "calc(var(--spacing-0-5) * 1.25)" },
  };
  const elevationTokens: Record<string, { value: string }> = {
    "elevation-0": { value: "none" },
    "elevation-1": { value: "var(--shadow-outline-faint)" },
    "elevation-2": { value: "var(--shadow-outline-subtle)" },
    "elevation-3": { value: "var(--shadow-control)" },
  };
  const ringMetricTokens: Record<string, { value: string }> = {
    "ring-diameter-xs": { value: "var(--space-5)" },
    "ring-diameter-s": { value: "var(--space-6)" },
    "ring-diameter-m": { value: "var(--space-8)" },
    "ring-diameter-l": { value: "calc(var(--space-8) * 3.5)" },
    "ring-stroke-xs": { value: "var(--ring-size-1)" },
    "ring-stroke-s": { value: "var(--ring-size-1)" },
    "ring-stroke-m": { value: "var(--ring-size-2)" },
    "ring-stroke-l": { value: "var(--ring-size-2)" },
    "ring-inset": { value: "calc(var(--space-3) / 2)" },
  };
  const skeletonTokens: Record<string, { value: string }> = {
    "skeleton-bg": { value: "hsl(var(--muted) / 0.6)" },
    "skeleton-fill": { value: "hsl(var(--foreground) / 0.08)" },
  };
  const noiseTokens: Record<string, { value: string }> = {
    "gradient-noise-opacity": { value: "0.1" },
    "gradient-noise-overlay-opacity": { value: "0.06" },
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
  const themeSegment = stripSupportsBlocks(themeCss);
  const rootBlocks = Array.from(
    themeSegment.matchAll(/:root\s*{([\s\S]*?)}/g),
    (match) => match[1],
  );
  const themeBase =
    rootBlocks.length > 0 ? rootBlocks.join("\n") : themeSegment;
  let match: RegExpExecArray | null;
  while ((match = colorRegex.exec(themeBase))) {
    const name = match[1];
    if (
      name.startsWith("radius-") ||
      name.startsWith("spacing-") ||
      isDeprecatedToken(name)
    ) {
      continue;
    }
    colors[name] = { value: match[2].trim() };
  }
  colors.focus = { value: "var(--theme-ring)" };
  const derivedColorTokens: Record<string, string> = {
    "bg": "var(--background)",
    "stat-good": "var(--success)",
    "stat-warn": "var(--warning)",
    "stat-bad": "var(--danger)",
    "glitch-pixel": "var(--glitch-noise-level)",
    "scanline": "var(--glitch-scanline)",
    "depth-shadow-inset": "var(--depth-shadow-inner)",
    "shadow-inner-sm":
      "inset 0 var(--spacing-0-125) var(--spacing-0-5) hsl(var(--shadow-color) / 0.18)",
    "shadow-inner-md":
      "inset 0 var(--spacing-0-25) var(--spacing-1) hsl(var(--shadow-color) / 0.28)",
    "shadow-inner-lg":
      "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
    "shadow-outer-sm":
      "0 var(--spacing-2) var(--spacing-4) hsl(var(--shadow-color) / 0.24)",
    "shadow-outer-md":
      "0 var(--spacing-3) var(--spacing-6) hsl(var(--shadow-color) / 0.3)",
    "shadow-outer-lg":
      "0 var(--spacing-4) var(--spacing-7) hsl(var(--shadow-color) / 0.36)",
    "shadow-outer-xl":
      "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
    "card-elev-1":
      "var(--shadow-outline-faint), var(--shadow-outer-sm)",
    "card-elev-2":
      "var(--shadow-outline-subtle), var(--shadow-outer-md)",
    "card-elev-3":
      "var(--shadow-outline-subtle), var(--shadow-outer-lg)",
    "glow-ring-sm":
      "0 0 0 calc(var(--spacing-0-25)) hsl(var(--ring) / 0.45)",
    "glow-ring-md":
      "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-2) hsl(var(--ring) / 0.2)",
    "glow-ring":
      "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
    "danger-surface-foreground": "var(--danger-foreground)",
    "surface-overlay-soft": "0.12",
    "surface-overlay-strong": "0.2",
    "glitch-card-surface-top": "hsl(var(--card) / 0.78)",
    "glitch-card-surface-bottom": "hsl(var(--panel) / 0.66)",
    "surface-card-soft":
      "linear-gradient(180deg, hsl(var(--card) / 0.65), hsl(var(--card) / 0.45))",
    "surface-card-strong":
      "linear-gradient(180deg, hsl(var(--card) / 0.85), hsl(var(--card) / 0.65))",
    "surface-card-strong-hover":
      "linear-gradient(180deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.75))",
    "surface-card-strong-active":
      "linear-gradient(180deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.6))",
    "surface-card-strong-today":
      "linear-gradient(180deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.7))",
    "surface-card-strong-empty":
      "linear-gradient(180deg, hsl(var(--card) / 0.6), hsl(var(--card) / 0.5))",
    "surface-rail-accent":
      "linear-gradient(180deg, hsl(var(--accent)), hsl(var(--primary)))",
    "glow-primary": "hsl(var(--primary) / 0.55)",
    "glow-pulse":
      "glow-pulse var(--dur-slow) var(--ease-out) infinite alternate",
    "blob-surface":
      "color-mix(in oklab, hsl(var(--surface)) 70%, hsl(var(--surface-2)) 30%)",
    "blob-surface-1": "hsl(var(--surface))",
    "blob-surface-2": "hsl(var(--surface-2))",
    "blob-surface-3": "hsl(var(--card))",
    "blob-surface-shadow": "hsl(var(--shadow-color) / 0.4)",
    "blob-radius-soft": "calc(var(--radius-2xl) + var(--spacing-2))",
    "drip-surface":
      "color-mix(in oklab, hsl(var(--accent)) 18%, hsl(var(--background)) 82%)",
    "gradient-blob-primary":
      "radial-gradient(120% 120% at 50% 10%, hsl(var(--surface) / 0.85), hsl(var(--surface-2) / 0.35), transparent 85%)",
    "gradient-drip-overlay":
      "radial-gradient(60% 40% at 10% 0%, hsl(var(--backdrop-drip-1) / 0.2), transparent 60%), radial-gradient(50% 35% at 100% 5%, hsl(var(--backdrop-drip-2) / 0.18), transparent 60%), radial-gradient(55% 35% at 50% 120%, hsl(var(--backdrop-drip-3) / 0.14), transparent 65%), radial-gradient(120% 100% at 50% 100%, hsl(var(--backdrop-drip-shadow) / 0.35), transparent 70%)",
    "gradient-drip-overlay-compact":
      "radial-gradient(125% 85% at 18% -20%, hsl(var(--backdrop-drip-1) / 0.28), transparent 65%), radial-gradient(115% 85% at 82% -15%, hsl(var(--backdrop-drip-2) / 0.24), transparent 62%), radial-gradient(120% 95% at 50% 110%, hsl(var(--backdrop-drip-3) / 0.16), transparent 70%)",
    "glitch-noise-primary": "hsl(var(--accent) / 0.25)",
    "glitch-noise-secondary": "hsl(var(--ring) / 0.2)",
    "glitch-noise-contrast": "hsl(var(--foreground) / 0.12)",
    "glitch-noise-hover": "calc(var(--glitch-noise-level) * 1.3)",
    "gradient-glitch-primary":
      "linear-gradient(135deg, hsl(var(--accent) / 0.35), hsl(var(--accent-2) / 0.3))",
    "gradient-glitch-overlay":
      "linear-gradient(120deg, hsl(var(--accent) / 0.12) 0%, transparent 58%, hsl(var(--ring) / 0.16) 100%), var(--card-overlay-scanlines)",
    "gradient-glitch-rail":
      "linear-gradient(180deg, hsl(var(--primary) / 0.6) 0%, hsl(var(--accent) / 0.45) 45%, hsl(var(--ring) / 0.6) 100%)",
    "gradient-hero-slot-highlight":
      "radial-gradient(circle at top left, var(--depth-glow-highlight-medium) 0%, transparent 62%)",
    "gradient-hero-slot-shadow":
      "radial-gradient(circle at bottom right, var(--depth-glow-shadow-medium) 0%, transparent 65%)",
    "gradient-hero-topline":
      "linear-gradient(90deg, hsl(var(--accent) / 0.28), transparent 55%, hsl(var(--accent-2) / 0.32))",
    "gradient-hero-action-halo":
      "radial-gradient(120% 95% at 50% 0%, hsl(var(--accent) / 0.24), transparent 65%)",
    "gradient-panel-tilt-strong":
      "linear-gradient(140deg, hsl(var(--card) / 0.95), hsl(var(--surface-2) / 0.78))",
    "gradient-panel-tilt-bright":
      "linear-gradient(140deg, hsl(var(--card) / 0.98), hsl(var(--surface-2) / 0.82))",
    "gradient-panel-tilt-muted":
      "linear-gradient(140deg, hsl(var(--card) / 0.94), hsl(var(--surface-2) / 0.72))",
    "glitch-rgb-shift":
      "drop-shadow(calc(var(--glitch-chromatic-offset-light) * -1) 0 0 hsl(var(--accent) / 0.45)) drop-shadow(var(--glitch-chromatic-offset-light) 0 0 hsl(var(--ring) / 0.45))",
    "glitch-scanline":
      "glitch-scanline calc(var(--glitch-duration) * 1.2) steps(2, end) infinite",
  };

  const reducedMotionTokens: Record<string, string> = {
    "glitch-scanline": "none",
    "glitch-rgb-shift": "none",
    "glow-pulse": "none",
  };

  for (const [name, value] of Object.entries(derivedColorTokens)) {
    colors[name] = { value };
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

  const controlShadowBase =
    "inset 0 var(--spacing-1) var(--spacing-2) 0 color-mix(in oklab, hsl(var(--shadow-color)) 18%, hsl(var(--background)) 82%),\n" +
    "    var(--shadow-outline-subtle)";
  colors["shadow-control"] = { value: controlShadowBase };

  assertRequiredThemeTokens(colors);

  const sd = new StyleDictionary({
    tokens: {
      ...colors,
      ...derivedSpacing,
      ...spaceAliases,
      ...extendedSpace,
      ...ringTokens,
      ...iconStrokeTokens,
      ...elevationTokens,
      ...ringMetricTokens,
      ...skeletonTokens,
      ...noiseTokens,
      spacing,
      radius,
    },
    platforms: {
      css: {
        transforms: ["attribute/cti", "name/kebab"],
        buildPath: "tokens/",
        files: [{ destination: "tokens.css", format: "css/variables" }],
      },
      js: {
        transforms: ["attribute/cti", "name/camel"],
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
        transforms: ["attribute/cti", "name/kebab"],
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
  await applyMotionOverrides(tokensPath, derivedColorTokens, reducedMotionTokens);
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

const MOTION_NO_PREFERENCE_REGEX =
  /@media \(prefers-reduced-motion: no-preference\) {\s*:root {\s*(?:--[a-z0-9-]+: [^;]+;\s*)+}\s*}\s*/gi;

const MOTION_REDUCED_REGEX =
  /@media \(prefers-reduced-motion: reduce\) {\s*:root {\s*(?:--[a-z0-9-]+: [^;]+;\s*)+}\s*}\s*/gi;

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

async function applyMotionOverrides(
  filePath: string,
  baseTokens: Record<string, string>,
  reducedTokens: Record<string, string>,
): Promise<void> {
  const css = await readCssWithRetry(filePath);
  const sanitized = css
    .replace(MOTION_NO_PREFERENCE_REGEX, "")
    .replace(MOTION_REDUCED_REGEX, "")
    .trimEnd();

  const baseEntries = Object.keys(reducedTokens)
    .map((name) => {
      const value = baseTokens[name];
      if (!value) {
        return undefined;
      }
      return `    --${name}: ${value};`;
    })
    .filter((entry): entry is string => Boolean(entry));

  const reducedEntries = Object.entries(reducedTokens).map(
    ([name, value]) => `    --${name}: ${value};`,
  );

  if (baseEntries.length === 0 || reducedEntries.length === 0) {
    await fs.writeFile(filePath, `${sanitized}\n`);
    return;
  }

  const noPreferenceBlock = [
    "@media (prefers-reduced-motion: no-preference) {",
    "  :root {",
    ...baseEntries,
    "  }",
    "}",
  ].join("\n");

  const reducedBlock = [
    "@media (prefers-reduced-motion: reduce) {",
    "  :root {",
    ...reducedEntries,
    "  }",
    "}",
  ].join("\n");

  const content = `${sanitized}\n\n${noPreferenceBlock}\n\n${reducedBlock}\n`;
  await fs.writeFile(filePath, content);
}
