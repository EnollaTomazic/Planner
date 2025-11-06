import plugin from "tailwindcss/plugin";
import type { RecursiveKeyValuePair } from "tailwindcss/types/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type TokenManifest = Record<string, string>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANIFEST_PATH = path.resolve(__dirname, "../tokens/tokens.json");

const SPECIAL_VAR_ALIASES: Record<string, string> = {
  spacing0125: "spacing-0-125",
  spacing025: "spacing-0-25",
  spacing05: "spacing-0-5",
  spacing075: "spacing-0-75",
};

let manifestCache: TokenManifest | null = null;

export const toCssVarName = (token: string): string => {
  const normalized = token
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .replace(/([0-9])([a-zA-Z])/g, "$1-$2")
    .toLowerCase();
  return SPECIAL_VAR_ALIASES[token] ?? normalized;
};

export const cssVar = (token: string): string => `var(--${toCssVarName(token)})`;

export const hslVar = (token: string): string => `hsl(${cssVar(token)})`;

export const loadTokenManifest = (): TokenManifest => {
  if (manifestCache) {
    return manifestCache;
  }

  let contents: string;
  try {
    contents = readFileSync(MANIFEST_PATH, "utf8");
  } catch (error) {
    throw new Error(
      `Unable to load ${path.relative(process.cwd(), MANIFEST_PATH)}. Run pnpm run generate-tokens before invoking Tailwind or design lint scripts.`,
      { cause: error },
    );
  }

  const parsed: TokenManifest = JSON.parse(contents);
  manifestCache = parsed;
  return parsed;
};

const assertToken = (manifest: TokenManifest, token: string): void => {
  if (!(token in manifest)) {
    throw new Error(
      `Token "${token}" missing from tokens.json. Run scripts/generate-tokens.ts to regenerate design tokens.`,
    );
  }
};

const hslToken = (_manifest: TokenManifest, token: string): string => hslVar(token);

const cssToken = (manifest: TokenManifest, token: string): string => {
  assertToken(manifest, token);
  return cssVar(token);
};

const cardHairlineOpacity = (
  manifest: TokenManifest,
  percent: number,
): string => {
  assertToken(manifest, "border");
  return `hsl(${cssVar("border")} / ${percent / 100})`;
};

const buildSpacingScale = (manifest: TokenManifest): Record<string, string> => {
  const spacing: Record<string, string> = {};
  for (let step = 1; step <= 8; step += 1) {
    const key = `spacing${step}`;
    assertToken(manifest, key);
    spacing[`${step}`] = manifest[key];
    spacing[`space-${step}`] = cssToken(manifest, `space${step}`);
  }

  spacing["spacing-0-125"] = cssToken(manifest, "spacing0125");
  spacing["spacing-0-25"] = cssToken(manifest, "spacing025");
  spacing["spacing-0-5"] = cssToken(manifest, "spacing05");
  spacing["spacing-0-75"] = cssToken(manifest, "spacing075");

  spacing["space-9"] = cssToken(manifest, "space9");
  spacing["space-10"] = cssToken(manifest, "space10");
  spacing["space-11"] = cssToken(manifest, "space11");
  spacing["space-12"] = cssToken(manifest, "space12");
  spacing["space-16"] = cssToken(manifest, "space16");

  return spacing;
};

const buildBorderRadiusScale = (
  manifest: TokenManifest,
): Record<string, string> => {
  const radiusKeys = [
    "radiusSm",
    "radiusMd",
    "radiusLg",
    "radiusXl",
    "radius2xl",
    "radiusFull",
  ] as const;

  for (const key of radiusKeys) {
    assertToken(manifest, key);
  }

  return {
    sm: manifest.radiusSm,
    md: manifest.radiusMd,
    lg: manifest.radiusLg,
    xl: manifest.radiusXl,
    "2xl": manifest.radius2xl,
    full: manifest.radiusFull,
  };
};

const buildColorPalette = (
  manifest: TokenManifest,
): RecursiveKeyValuePair<string, string> => {
  const auroraLight = hslToken(manifest, "auroraGLight");
  const auroraPurpleLight = hslToken(manifest, "auroraPLight");

  return {
    border: {
      DEFAULT: hslToken(manifest, "border"),
      subtle: hslToken(manifest, "borderSubtle"),
    },
    input: hslToken(manifest, "input"),
    ring: {
      DEFAULT: hslToken(manifest, "ring"),
      contrast: cssToken(manifest, "ringContrast"),
    },
    focus: cssToken(manifest, "focus"),
    background: hslToken(manifest, "background"),
    foreground: hslToken(manifest, "foreground"),
    card: {
      DEFAULT: hslToken(manifest, "card"),
      foreground: hslToken(manifest, "cardForeground"),
    },
    surface: {
      DEFAULT: hslToken(manifest, "surface"),
      foreground: hslToken(manifest, "foreground"),
    },
    "surface-muted": hslToken(manifest, "surfaceMuted"),
    "surface-hover": hslToken(manifest, "surfaceHover"),
    "surface-2": {
      DEFAULT: hslToken(manifest, "surface2"),
      foreground: hslToken(manifest, "foreground"),
    },
    panel: { DEFAULT: hslToken(manifest, "panel") },
    "card-hairline": {
      DEFAULT: cssToken(manifest, "cardHairline"),
      40: cardHairlineOpacity(manifest, 40),
      45: cardHairlineOpacity(manifest, 45),
      55: cardHairlineOpacity(manifest, 55),
      60: cardHairlineOpacity(manifest, 60),
      65: cardHairlineOpacity(manifest, 65),
      70: cardHairlineOpacity(manifest, 70),
      75: cardHairlineOpacity(manifest, 75),
      90: cardHairlineOpacity(manifest, 90),
    },
    primary: {
      DEFAULT: hslToken(manifest, "primary"),
      foreground: hslToken(manifest, "primaryForeground"),
      soft: hslToken(manifest, "primarySoft"),
    },
    accent: {
      DEFAULT: hslToken(manifest, "accent1"),
      foreground: hslToken(manifest, "accent1Foreground"),
      soft: hslToken(manifest, "accent1Soft"),
      hover: cssToken(manifest, "accent1Hover"),
      overlay: cssToken(manifest, "accentOverlay"),
      contrast: hslToken(manifest, "accent1Contrast"),
    },
    on: {
      accent: cssToken(manifest, "textOnAccent"),
    },
    "accent-3": { DEFAULT: hslToken(manifest, "accent3") },
    "accent-2": {
      DEFAULT: hslToken(manifest, "accent2"),
      foreground: hslToken(manifest, "accent2Foreground"),
    },
    glow: hslToken(manifest, "glow"),
    "ring-muted": hslToken(manifest, "ringMuted"),
    danger: {
      DEFAULT: hslToken(manifest, "danger"),
      foreground: hslToken(manifest, "dangerForeground"),
    },
    warning: {
      DEFAULT: hslToken(manifest, "warning"),
      soft: hslToken(manifest, "warningSoft"),
      "soft-strong": hslToken(manifest, "warningSoftStrong"),
      foreground: hslToken(manifest, "warningForeground"),
    },
    success: {
      DEFAULT: hslToken(manifest, "success"),
      glow: hslToken(manifest, "successGlow"),
      soft: hslToken(manifest, "successSoft"),
      foreground: hslToken(manifest, "successForeground"),
    },
    tone: {
      top: hslToken(manifest, "toneTop"),
      jg: hslToken(manifest, "toneJg"),
      mid: hslToken(manifest, "toneMid"),
      bot: hslToken(manifest, "toneBot"),
      sup: hslToken(manifest, "toneSup"),
    },
    "aurora-g": hslToken(manifest, "auroraG"),
    "aurora-g-light": `var(--aurora-g-light-color, ${auroraLight})`,
    "aurora-p": hslToken(manifest, "auroraP"),
    "aurora-p-light": `var(--aurora-p-light-color, ${auroraPurpleLight})`,
    muted: {
      DEFAULT: hslToken(manifest, "muted"),
      foreground: hslToken(manifest, "mutedForeground"),
    },
    "lav-deep": hslToken(manifest, "lavDeep"),
    "surface-vhs": hslToken(manifest, "surfaceVhs"),
    "surface-streak": hslToken(manifest, "surfaceStreak"),
    interaction: {
      primary: {
        hover: `hsl(${cssVar("accent1")} / 0.14)`,
        active: `hsl(${cssVar("accent1")} / 0.2)`,
      },
      focus: {
        hover: `hsl(${cssVar("focus")} / 0.14)`,
        active: `hsl(${cssVar("focus")} / 0.2)`,
        surfaceHover: `hsl(${cssVar("focus")} / 0.25)`,
        surfaceActive: `hsl(${cssVar("focus")} / 0.35)`,
        tintHover: `hsl(${cssVar("focus")} / 0.1)`,
        tintActive: `hsl(${cssVar("focus")} / 0.2)`,
      },
      accent: {
        hover: `hsl(${cssVar("accent1")} / 0.14)`,
        active: `hsl(${cssVar("accent1")} / 0.2)`,
        surfaceHover: `hsl(${cssVar("accent1")} / 0.25)`,
        surfaceActive: `hsl(${cssVar("accent1")} / 0.35)`,
        tintHover: `hsl(${cssVar("accent1")} / 0.1)`,
        tintActive: `hsl(${cssVar("accent1")} / 0.2)`,
      },
      info: {
        hover: `hsl(${cssVar("accent2")} / 0.14)`,
        active: `hsl(${cssVar("accent2")} / 0.2)`,
        surfaceHover: `hsl(${cssVar("accent2")} / 0.25)`,
        surfaceActive: `hsl(${cssVar("accent2")} / 0.35)`,
        tintHover: `hsl(${cssVar("accent2")} / 0.1)`,
        tintActive: `hsl(${cssVar("accent2")} / 0.2)`,
      },
      danger: {
        hover: `hsl(${cssVar("danger")} / 0.14)`,
        active: `hsl(${cssVar("danger")} / 0.2)`,
        surfaceHover: `hsl(${cssVar("danger")} / 0.12)`,
        surfaceActive: `hsl(${cssVar("danger")} / 0.1)`,
        tintHover: `hsl(${cssVar("danger")} / 0.1)`,
        tintActive: `hsl(${cssVar("danger")} / 0.2)`,
      },
      foreground: {
        tintHover: `hsl(${cssVar("foreground")} / 0.1)`,
        tintActive: `hsl(${cssVar("foreground")} / 0.2)`,
      },
    },
  };
};

const manifest = loadTokenManifest();
const spacing = buildSpacingScale(manifest);
const borderRadius = buildBorderRadiusScale(manifest);
const colors = buildColorPalette(manifest);

const tokenPlugin = plugin(() => {}, {
  theme: {
    extend: {
      colors,
      borderRadius,
      spacing,
    },
  },
});

export default tokenPlugin;
