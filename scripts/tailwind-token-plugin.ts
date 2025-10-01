import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import plugin from "tailwindcss/plugin";
import type { RecursiveKeyValuePair } from "tailwindcss/types/config";

type TokenManifest = Record<string, string>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANIFEST_PATH = path.resolve(__dirname, "../tokens/tokens.json");

const cssVarToManifestKey = (token: string): string =>
  token.toLowerCase().replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

const loadManifest = (): TokenManifest => {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw) as TokenManifest;
  return parsed;
};

const manifest = loadManifest();

const ensureToken = (cssVar: string): void => {
  const key = cssVarToManifestKey(cssVar);
  if (!(key in manifest)) {
    throw new Error(
      `Design token "--${cssVar}" is missing from tokens.json. Run npm run generate-tokens.`,
    );
  }
};

const requireTokens = (...cssVars: string[]): void => {
  for (const token of cssVars) {
    ensureToken(token);
  }
};

const hslVar = (cssVar: string): string => {
  ensureToken(cssVar);
  return `hsl(var(--${cssVar}))`;
};

const rawVar = (cssVar: string): string => {
  ensureToken(cssVar);
  return `var(--${cssVar})`;
};

const cardHairlineOpacity = (percent: number): string => {
  ensureToken("border");
  return `hsl(var(--border) / ${percent / 100})`;
};

type SpacingEntry =
  | { themeKey: string; cssVar: string; mode: "manifest" }
  | { themeKey: string; cssVar: string; mode: "var" };

const createSpacingScale = (): Record<string, string> => {
  const entries: SpacingEntry[] = [
    ...Array.from({ length: 8 }, (_, index) => ({
      themeKey: `${index + 1}`,
      cssVar: `spacing-${index + 1}`,
      mode: "manifest" as const,
    })),
    ...Array.from({ length: 8 }, (_, index) => ({
      themeKey: `space-${index + 1}`,
      cssVar: `space-${index + 1}`,
      mode: "var" as const,
    })),
    { themeKey: "spacing-0-125", cssVar: "spacing-0-125", mode: "var" },
    { themeKey: "spacing-0-25", cssVar: "spacing-0-25", mode: "var" },
    { themeKey: "spacing-0-5", cssVar: "spacing-0-5", mode: "var" },
    { themeKey: "spacing-0-75", cssVar: "spacing-0-75", mode: "var" },
    { themeKey: "space-9", cssVar: "space-9", mode: "var" },
    { themeKey: "space-10", cssVar: "space-10", mode: "var" },
    { themeKey: "space-11", cssVar: "space-11", mode: "var" },
    { themeKey: "space-12", cssVar: "space-12", mode: "var" },
    { themeKey: "space-16", cssVar: "space-16", mode: "var" },
  ];

  return entries.reduce<Record<string, string>>((acc, entry) => {
    ensureToken(entry.cssVar);
    const manifestKey = cssVarToManifestKey(entry.cssVar);
    if (entry.mode === "manifest") {
      acc[entry.themeKey] = manifest[manifestKey];
    } else {
      acc[entry.themeKey] = `var(--${entry.cssVar})`;
    }
    return acc;
  }, {});
};

const createRadiusScale = (): Record<string, string> => {
  const tokens = ["sm", "md", "lg", "xl", "2xl", "full"];
  return tokens.reduce<Record<string, string>>((acc, token) => {
    const cssVar = `radius-${token}`;
    ensureToken(cssVar);
    const manifestKey = cssVarToManifestKey(cssVar);
    acc[token] = manifest[manifestKey];
    return acc;
  }, {});
};

const auroraFallback = (lightToken: string, colorToken: string): string => {
  requireTokens(lightToken, colorToken);
  return `var(--${colorToken}, hsl(var(--${lightToken})))`;
};

const createColorConfig = (): RecursiveKeyValuePair<string, string> => {
  requireTokens("focus");
  return {
    border: {
      DEFAULT: hslVar("border"),
      subtle: hslVar("border-subtle"),
    },
    input: hslVar("input"),
    ring: {
      DEFAULT: hslVar("ring"),
      contrast: rawVar("ring-contrast"),
    },
    background: hslVar("background"),
    foreground: hslVar("foreground"),
    card: {
      DEFAULT: hslVar("card"),
      foreground: hslVar("card-foreground"),
    },
    surface: {
      DEFAULT: hslVar("surface"),
      foreground: hslVar("foreground"),
    },
    "surface-muted": hslVar("surface-muted"),
    "surface-hover": hslVar("surface-hover"),
    "surface-2": {
      DEFAULT: hslVar("surface-2"),
      foreground: hslVar("foreground"),
    },
    panel: {
      DEFAULT: hslVar("panel"),
    },
    "card-hairline": {
      DEFAULT: rawVar("card-hairline"),
      40: cardHairlineOpacity(40),
      45: cardHairlineOpacity(45),
      55: cardHairlineOpacity(55),
      60: cardHairlineOpacity(60),
      65: cardHairlineOpacity(65),
      70: cardHairlineOpacity(70),
      75: cardHairlineOpacity(75),
      90: cardHairlineOpacity(90),
    },
    primary: {
      DEFAULT: hslVar("primary"),
      foreground: hslVar("primary-foreground"),
      soft: hslVar("primary-soft"),
    },
    accent: {
      DEFAULT: hslVar("accent"),
      foreground: hslVar("accent-foreground"),
      soft: hslVar("accent-soft"),
      overlay: rawVar("accent-overlay"),
    },
    on: {
      accent: rawVar("text-on-accent"),
    },
    "accent-3": {
      DEFAULT: hslVar("accent-3"),
    },
    "accent-2": {
      DEFAULT: hslVar("accent-2"),
      foreground: hslVar("accent-2-foreground"),
    },
    glow: hslVar("glow"),
    "ring-muted": hslVar("ring-muted"),
    danger: {
      DEFAULT: hslVar("danger"),
      foreground: hslVar("danger-foreground"),
    },
    warning: {
      DEFAULT: hslVar("warning"),
      soft: hslVar("warning-soft"),
      "soft-strong": hslVar("warning-soft-strong"),
      foreground: hslVar("warning-foreground"),
    },
    success: {
      DEFAULT: hslVar("success"),
      glow: hslVar("success-glow"),
      soft: hslVar("success-soft"),
      foreground: hslVar("success-foreground"),
    },
    tone: {
      top: hslVar("tone-top"),
      jg: hslVar("tone-jg"),
      mid: hslVar("tone-mid"),
      bot: hslVar("tone-bot"),
      sup: hslVar("tone-sup"),
    },
    "aurora-g": hslVar("aurora-g"),
    "aurora-g-light": auroraFallback("aurora-g-light", "aurora-g-light-color"),
    "aurora-p": hslVar("aurora-p"),
    "aurora-p-light": auroraFallback("aurora-p-light", "aurora-p-light-color"),
    muted: {
      DEFAULT: hslVar("muted"),
      foreground: hslVar("muted-foreground"),
    },
    "lav-deep": hslVar("lav-deep"),
    "surface-vhs": hslVar("surface-vhs"),
    "surface-streak": hslVar("surface-streak"),
    interaction: {
      primary: {
        hover: "hsl(var(--accent) / 0.14)",
        active: "hsl(var(--accent) / 0.2)",
        surfaceHover: "hsl(var(--accent) / 0.25)",
        surfaceActive: "hsl(var(--accent) / 0.35)",
        tintHover: "hsl(var(--accent) / 0.1)",
        tintActive: "hsl(var(--accent) / 0.2)",
      },
      focus: {
        hover: "hsl(var(--focus) / 0.14)",
        active: "hsl(var(--focus) / 0.2)",
        surfaceHover: "hsl(var(--focus) / 0.25)",
        surfaceActive: "hsl(var(--focus) / 0.35)",
        tintHover: "hsl(var(--focus) / 0.1)",
        tintActive: "hsl(var(--focus) / 0.2)",
      },
      accent: {
        hover: "hsl(var(--accent) / 0.14)",
        active: "hsl(var(--accent) / 0.2)",
        surfaceHover: "hsl(var(--accent) / 0.25)",
        surfaceActive: "hsl(var(--accent) / 0.35)",
        tintHover: "hsl(var(--accent) / 0.1)",
        tintActive: "hsl(var(--accent) / 0.2)",
      },
      info: {
        hover: "hsl(var(--accent-2) / 0.14)",
        active: "hsl(var(--accent-2) / 0.2)",
        surfaceHover: "hsl(var(--accent-2) / 0.25)",
        surfaceActive: "hsl(var(--accent-2) / 0.35)",
        tintHover: "hsl(var(--accent-2) / 0.1)",
        tintActive: "hsl(var(--accent-2) / 0.2)",
      },
      danger: {
        hover: "hsl(var(--danger) / 0.14)",
        active: "hsl(var(--danger) / 0.2)",
        surfaceHover: "hsl(var(--danger) / 0.12)",
        surfaceActive: "hsl(var(--danger) / 0.1)",
        tintHover: "hsl(var(--danger) / 0.1)",
        tintActive: "hsl(var(--danger) / 0.2)",
      },
      foreground: {
        tintHover: "hsl(var(--foreground) / 0.1)",
        tintActive: "hsl(var(--foreground) / 0.2)",
      },
    },
  };
};

const tailwindTokenPlugin = plugin(() => {}, {
  theme: {
    extend: {
      colors: createColorConfig(),
      spacing: createSpacingScale(),
      borderRadius: createRadiusScale(),
    },
  },
});

export default tailwindTokenPlugin;

