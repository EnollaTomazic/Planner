export type TokenValue = string | string[];

export interface VariableDefinition {
  name: string;
  value: TokenValue;
  comment?: string | string[];
}

export interface ThemeDefinition {
  id: string;
  label: string;
  description?: string[];
  variables: VariableDefinition[];
}

export const rootVariables: VariableDefinition[] = [
  { name: "lg-violet", value: "var(--ring)" },
  { name: "lg-cyan", value: "var(--accent-2)" },
  { name: "lg-pink", value: "var(--lav-deep)" },
  { name: "lg-black", value: "var(--background)" },
  { name: "card-foreground", value: "var(--foreground)" },
  { name: "header-stack", value: "calc(var(--spacing-8) + var(--spacing-4))" },
  { name: "layout-gutter-sm", value: "var(--spacing-4)" },
  { name: "layout-gutter-md", value: "var(--spacing-5)" },
  { name: "layout-gutter-lg", value: "var(--spacing-6)" },
  {
    name: "layout-quick-action-min",
    value: "calc(var(--spacing-8) * 3)",
  },
  {
    name: "layout-quick-action-tooltip-max",
    value: "calc(var(--spacing-8) * 5)",
  },
  { name: "card-radius", value: "var(--radius-xl)" },
  { name: "elevation-card", value: "var(--shadow-outline-subtle)" },
  {
    name: "elevation-card-pressed",
    value: "var(--shadow-control)",
  },
  {
    comment: "Depth & surface spacing (neumorphism)",
    name: "neo-depth-sm",
    value: "var(--spacing-1)",
  },
  { name: "neo-depth-md", value: "var(--spacing-3)" },
  { name: "neo-depth-lg", value: "var(--spacing-4)" },
  {
    name: "neo-surface",
    value: "color-mix(in oklab, hsl(var(--card)) 88%, hsl(var(--panel)) 12%)",
  },
  {
    name: "neo-surface-alt",
    value: "color-mix(in oklab, hsl(var(--panel)) 82%, hsl(var(--card)) 18%)",
  },
  {
    name: "neo-highlight",
    value: "color-mix(in oklab, hsl(var(--ring)) 18%, hsl(var(--card)))",
  },
  { name: "success-foreground", value: "0 0% 100%" },
  { name: "warning-foreground", value: "0 0% 100%" },
  { name: "danger-foreground", value: "0 0% 100%" },
  { name: "state-success-surface", value: "hsl(var(--success) / 0.18)" },
  { name: "state-success-border", value: "hsl(var(--success) / 0.55)" },
  { name: "state-warning-surface", value: "hsl(var(--warning) / 0.2)" },
  { name: "state-warning-border", value: "hsl(var(--warning) / 0.6)" },
  { name: "state-danger-surface", value: "hsl(var(--danger) / 0.18)" },
  { name: "state-danger-border", value: "hsl(var(--danger) / 0.62)" },
  {
    comment: "Depth shadows (outer/inner)",
    name: "depth-shadow-outer",
    value: "var(--shadow-depth-outer)",
  },
  { name: "depth-shadow-outer-strong", value: "var(--shadow-depth-outer-strong)" },
  { name: "depth-shadow-soft", value: "var(--shadow-depth-soft)" },
  { name: "depth-shadow-inner", value: "var(--shadow-depth-inner)" },
  {
    name: "shadow-inner-sm",
    value:
      "inset 0 var(--spacing-0-125) var(--spacing-0-5) hsl(var(--shadow-color) / 0.18)",
  },
  {
    name: "shadow-inner-md",
    value:
      "inset 0 var(--spacing-0-25) var(--spacing-1) hsl(var(--shadow-color) / 0.28)",
  },
  {
    name: "shadow-inner-lg",
    value:
      "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
  },
  {
    name: "shadow-outer-sm",
    value: "0 var(--spacing-2) var(--spacing-4) hsl(var(--shadow-color) / 0.24)",
  },
  {
    name: "shadow-outer-md",
    value: "0 var(--spacing-3) var(--spacing-6) hsl(var(--shadow-color) / 0.3)",
  },
  {
    name: "shadow-outer-lg",
    value: "0 var(--spacing-4) var(--spacing-7) hsl(var(--shadow-color) / 0.36)",
  },
  {
    name: "shadow-outer-xl",
    value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
  },
  {
    comment: "Depth glow ramps",
    name: "depth-glow-highlight-soft",
    value: "hsl(var(--highlight) / 0.08)",
  },
  { name: "depth-glow-highlight-medium", value: "hsl(var(--highlight) / 0.35)" },
  { name: "depth-glow-highlight-strong", value: "hsl(var(--highlight) / 0.55)" },
  {
    name: "depth-glow-shadow-soft",
    value: "hsl(var(--shadow-color) / 0.14)",
  },
  { name: "depth-glow-shadow-medium", value: "hsl(var(--shadow-color) / 0.28)" },
  { name: "depth-glow-shadow-strong", value: "hsl(var(--shadow-color) / 0.42)" },
  {
    name: "depth-focus-ring-rest",
    value: [
      "",
      "0 0 0 0 hsl(var(--ring) / 0),",
      "0 0 0 0 hsl(var(--ring) / 0)",
    ],
  },
  {
    name: "depth-focus-ring-active",
    value: [
      "",
      "0 0 0 calc(var(--hairline-w) * 1) hsl(var(--ring))",
      "var(--shadow-glow-lg)",
    ],
  },
  { name: "hero-illustration-opacity", value: "0.84" },
  {
    name: "hero-illustration-blur",
    value: "calc(var(--space-4) + var(--space-1))",
  },
  {
    comment: "Hero/backdrop intensity controls",
    name: "glitch-intensity-hero-rail",
    value: "0.74",
  },
  { name: "glitch-intensity-backdrop-blob-1", value: "0.18" },
  { name: "glitch-intensity-backdrop-blob-2", value: "0.16" },
  { name: "glitch-intensity-backdrop-blob-3", value: "0.12" },
  { name: "glitch-intensity-backdrop-drip-1", value: "0.23" },
  { name: "glitch-intensity-backdrop-drip-2", value: "0.2" },
  { name: "glitch-intensity-backdrop-drip-3", value: "0.16" },
  { name: "glitch-intensity-backdrop-shadow", value: "0.38" },
  {
    comment: "Organic backdrops",
    name: "backdrop-blob-1",
    value: "var(--lg-violet)",
  },
  { name: "backdrop-blob-2", value: "var(--lg-cyan)" },
  { name: "backdrop-blob-3", value: "var(--lg-pink)" },
  { name: "backdrop-blob-shadow", value: "var(--lg-black)" },
  { name: "backdrop-grid-primary", value: "var(--accent)" },
  { name: "backdrop-grid-secondary", value: "var(--accent)" },
  { name: "backdrop-grid-opacity", value: "0.1" },
  {
    comment: "Grid overlay tokens (opacity / scale / color)",
    name: "grid-color",
    value: "var(--accent)",
  },
  { name: "grid-alpha", value: "0.1" },
  {
    name: "grid-size",
    value: "calc(var(--space-6) - var(--space-1))",
  },
  { name: "backdrop-drip-1", value: "var(--backdrop-blob-1)" },
  { name: "backdrop-drip-2", value: "var(--backdrop-blob-2)" },
  { name: "backdrop-drip-3", value: "var(--backdrop-blob-3)" },
  { name: "backdrop-drip-shadow", value: "var(--backdrop-blob-shadow)" },
  { name: "blob-surface-1", value: "hsl(var(--surface))" },
  { name: "blob-surface-2", value: "hsl(var(--surface-2))" },
  { name: "blob-surface-3", value: "hsl(var(--card))" },
  { name: "blob-surface-shadow", value: "hsl(var(--shadow-color) / 0.4)" },
  {
    name: "blob-radius-soft",
    value: "calc(var(--radius-2xl) + var(--spacing-2))",
  },
  {
    comment: [
      "Glow parity (retro-futurism)",
      "neo-glow-strength multiplies --shadow-neon",
    ],
    name: "neo-glow-strength",
    value: "0.45",
  },
  { name: "glow-primary", value: "hsl(var(--primary) / 0.55)" },
  {
    name: "glow-ring",
    value:
      "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
  },
  { name: "neon-outline-opacity", value: "0.35" },
  {
    comment: [
      "Glitch normalization (identical amplitude & cadence)",
      "0–1 scaling for transforms/opacity",
    ],
    name: "glitch-intensity",
    value: "1.0",
  },
  { comment: "base animation length", name: "glitch-duration", value: "450ms" },
  { comment: "hue-rotate magnitude", name: "glitch-fringe", value: "12deg" },
  { comment: "overlay alpha", name: "glitch-static-opacity", value: "0.18" },
  { name: "glitch-noise-level", value: "var(--glitch-static-opacity)" },
  {
    comment: "Card glitch overlay alpha",
    name: "glitch-overlay-opacity-card",
    value: "0.55",
  },
  {
    comment: "Button glitch overlays",
    name: "glitch-overlay-button-opacity",
    value: "0.42",
  },
  {
    name: "glitch-overlay-button-opacity-reduced",
    value: "0.28",
  },
  {
    comment: "Chromatic separation offsets",
    name: "glitch-chromatic-offset-strong",
    value: "calc(var(--spacing-0-25) / 4)",
  },
  {
    name: "glitch-chromatic-offset-medium",
    value: "calc(var(--spacing-0-25) * 3 / 20)",
  },
  {
    name: "glitch-chromatic-offset-light",
    value: "calc(var(--spacing-0-25) / 10)",
  },
  { name: "glitch-halo-opacity", value: "0.28" },
  { name: "glitch-ring-color", value: "hsl(var(--ring) / 0.55)" },
  { name: "glitch-ring-blur", value: "var(--space-2)" },
  {
    name: "glitch-ring-shadow",
    value: "0 0 var(--glitch-ring-blur) var(--glitch-ring-color)",
  },
  { name: "glitch-accent-color", value: "hsl(var(--accent) / 0.35)" },
  { name: "glitch-accent-blur", value: "var(--spacing-0-5)" },
  {
    name: "glitch-accent-shadow",
    value: "0 0 var(--glitch-accent-blur) var(--glitch-accent-color)",
  },
  { name: "glitch-noise-primary", value: "hsl(var(--accent) / 0.055)" },
  { name: "glitch-noise-secondary", value: "hsl(var(--ring) / 0.05)" },
  { name: "glitch-noise-contrast", value: "hsl(var(--foreground) / 0.045)" },
  {
    name: "glitch-noise-hover",
    value: "calc(var(--glitch-noise-level) * 1.3)",
  },
  { comment: "Retro grid parity", name: "retro-grid-step", value: "24px" },
  { name: "retro-grid-opacity", value: "0.15" },
  {
    comment: ["Accessibility clamps", "used in tests; not CSS-enforced"],
    name: "aa-min-contrast",
    value: "4.5",
  },
  {
    name: "shadow-neon",
    value: [
      "",
      "0 0 var(--space-1) hsl(var(--neon) / 0.55),",
      "0 0 calc(var(--space-3) - var(--space-1) / 2) hsl(var(--neon) / 0.35),",
      "0 0 calc(var(--space-4) + var(--space-1) / 2) hsl(var(--neon) / 0.2)",
    ],
  },
  {
    name: "btn-primary-hover-shadow",
    value: [
      "0 calc(var(--space-1) / 2) calc(var(--space-3) / 2)",
      "calc(-1 * var(--space-1) / 4) hsl(var(--accent) / 0.25)",
    ],
  },
  {
    name: "btn-primary-active-shadow",
    value: ["inset 0 0 0 calc(var(--space-1) / 4)", "hsl(var(--accent) / 0.6)"],
  },
  { name: "pillar-wave-start", value: "257 90% 70%" },
  { name: "pillar-wave-end", value: "198 90% 62%" },
  { name: "pillar-wave-shadow", value: "258 90% 38% / 0.35" },
  { name: "pillar-trading-start", value: "292 85% 72%" },
  { name: "pillar-trading-end", value: "318 85% 66%" },
  { name: "pillar-trading-shadow", value: "292 85% 38% / 0.35" },
  { name: "pillar-vision-start", value: "157 70% 55%" },
  { name: "pillar-vision-end", value: "192 75% 60%" },
  { name: "pillar-vision-shadow", value: "170 70% 30% / 0.35" },
  { name: "pillar-tempo-start", value: "260 85% 70%" },
  { name: "pillar-tempo-end", value: "284 85% 65%" },
  { name: "pillar-tempo-shadow", value: "270 80% 35% / 0.35" },
  { name: "pillar-positioning-start", value: "190 90% 66%" },
  { name: "pillar-positioning-end", value: "220 90% 66%" },
  { name: "pillar-positioning-shadow", value: "205 85% 35% / 0.35" },
  { name: "pillar-comms-start", value: "286 90% 68%" },
  { name: "pillar-comms-end", value: "312 88% 66%" },
  { name: "pillar-comms-shadow", value: "300 80% 36% / 0.35" },
];

const CARD_BACKGROUND_MIN_LIGHTNESS_DELTA = 6;
const HSL_TOKEN_PATTERN =
  /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/;

interface HslComponents {
  hue: string;
  saturation: string;
  lightness: string;
}

function parseHslComponents(value: string): HslComponents | null {
  const match = value.trim().match(HSL_TOKEN_PATTERN);
  if (!match) {
    return null;
  }
  const [, hue, saturation, lightness] = match;
  return { hue, saturation, lightness };
}

function formatLightness(value: number): string {
  return Number.parseFloat(value.toFixed(2)).toString().replace(/\.0+$/, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function enforceCardContrast(theme: ThemeDefinition): ThemeDefinition {
  const backgroundVariable = theme.variables.find(
    (variable) => variable.name === "background",
  );
  const cardVariable = theme.variables.find(
    (variable) => variable.name === "card",
  );

  if (
    !backgroundVariable ||
    !cardVariable ||
    typeof backgroundVariable.value !== "string" ||
    typeof cardVariable.value !== "string"
  ) {
    return theme;
  }

  const backgroundComponents = parseHslComponents(backgroundVariable.value);
  const cardComponents = parseHslComponents(cardVariable.value);

  if (!backgroundComponents || !cardComponents) {
    return theme;
  }

  const backgroundLightness = Number.parseFloat(
    backgroundComponents.lightness,
  );
  const cardLightness = Number.parseFloat(cardComponents.lightness);

  if (Number.isNaN(backgroundLightness) || Number.isNaN(cardLightness)) {
    return theme;
  }

  const isDarkTheme = backgroundLightness < 50;
  const desiredLightness = isDarkTheme
    ? Math.max(
        cardLightness,
        backgroundLightness + CARD_BACKGROUND_MIN_LIGHTNESS_DELTA,
      )
    : Math.min(
        cardLightness,
        backgroundLightness - CARD_BACKGROUND_MIN_LIGHTNESS_DELTA,
      );

  if (Math.abs(desiredLightness - cardLightness) < 0.01) {
    return theme;
  }

  const adjustedLightness = clamp(desiredLightness, 0, 100);
  const formattedLightness = formatLightness(adjustedLightness);
  const updatedCardValue = `${cardComponents.hue} ${cardComponents.saturation}% ${formattedLightness}%`;

  const variables = theme.variables.map((variable) => {
    if (variable !== cardVariable) {
      return variable;
    }
    return { ...variable, value: updatedCardValue };
  });

  return { ...theme, variables };
}

const rawThemes: ThemeDefinition[] = [
  {
    id: "aurora",
    label: "Aurora",
    variables: [
      { name: "background", value: "284 78% 5%" },
      { name: "foreground", value: "268 32% 97%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "282 70% 8%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "280 58% 20%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "280 58% 13%" },
      { name: "ring", value: "152 100% 62%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "152 96% 58%" },
      { name: "primary-foreground", value: "0 0% 100%" },
      { name: "primary-soft", value: "152 100% 24%" },
      { name: "accent", value: "274 78% 64%" },
      { name: "accent-contrast", value: "274 80% 84%" },
      { name: "accent-2", value: "152 96% 56%" },
      { name: "accent-foreground", value: "0 0% 100%" },
      { name: "accent-soft", value: "274 78% 22%" },
      { name: "glow", value: "152 100% 68%" },
      { name: "muted", value: "280 52% 16%" },
      { name: "muted-foreground", value: "280 24% 76%" },
      { name: "surface", value: "282 64% 10%" },
      { name: "surface-2", value: "280 48% 18%" },
      { name: "surface-vhs", value: "284 72% 6%" },
      { name: "surface-streak", value: "280 42% 14%" },
      { name: "shadow-color", value: "152 80% 50%" },
      { name: "shadow", value: "0 12px 32px hsl(var(--shadow-color) / 0.3)" },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
      },
      { name: "hero-illustration-opacity", value: "0.82" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-4) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.7" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.2" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.14" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.4" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.4" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0" },
      { name: "glitch-intensity-backdrop-shadow", value: "0" },
      { name: "neo-glow-strength", value: "0.4" },
      { name: "glitch-intensity", value: "0.4" },
      { name: "glitch-fringe", value: "8deg" },
      { name: "glitch-static-opacity", value: "0.1" },
      { name: "lav-deep", value: "276 88% 68%" },
      { name: "icon-fg", value: "152 96% 72%" },
      { name: "success", value: "148 72% 48%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "148 72% 38% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "aurora-g", value: "var(--accent-2)" },
      { name: "aurora-g-light", value: "150 100% 85%" },
      { name: "aurora-p", value: "var(--accent)" },
      { name: "aurora-p-light", value: "272 80% 85%" },
      { name: "shadow-base", value: "280 32% 6%" },
      { name: "backdrop-blob-1", value: "var(--accent-2)" },
      { name: "backdrop-blob-2", value: "var(--accent)" },
      { name: "backdrop-blob-3", value: "var(--accent-2)" },
      { name: "backdrop-blob-shadow", value: "var(--card)" },
      { name: "backdrop-grid-primary", value: "var(--accent-2)" },
      { name: "backdrop-grid-secondary", value: "var(--accent)" },
      { name: "grid-color", value: "var(--accent-2)" },
      { name: "grid-alpha", value: "0.12" },
      {
        name: "grid-size",
        value: "calc(var(--space-6) + var(--space-1))",
      },
      { name: "backdrop-drip-1", value: "var(--accent-2)" },
      { name: "backdrop-drip-2", value: "var(--accent)" },
      { name: "backdrop-drip-3", value: "var(--accent-2)" },
      { name: "backdrop-drip-shadow", value: "var(--card)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
      },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "glitch-noise-hover", value: "calc(var(--glitch-noise-level) * 1.3)" },
      {
        name: "edge-iris",
        value: [
          "conic-gradient(",
          "from 180deg,",
          "hsl(var(--accent-2) / 0),",
          "hsl(var(--accent-2) / 0.7),",
          "hsl(var(--accent) / 0.7),",
          "hsl(var(--accent-2) / 0.7),",
          "hsl(var(--accent-2) / 0)",
          ")",
        ],
      },
      {
        name: "seg-active-grad",
        value: [
          "linear-gradient(",
          "90deg,",
          "hsl(var(--accent-2) / 0.3),",
          "hsl(var(--accent) / 0.32),",
          "hsl(var(--accent-2) / 0.3)",
        ")",
      ],
      },
      { name: "shadow", value: "0 10px 30px hsl(var(--shadow-base) / 0.28)" },
    ],
  },
  {
    id: "citrus",
    label: "Citrus",
    description: ["Dark citrus palette inspired by industrial orange hardware"],
    variables: [
      { name: "background", value: "210 16% 7%" },
      { name: "foreground", value: "32 42% 96%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "212 20% 11%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "212 22% 26%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "212 24% 15%" },
      { name: "ring", value: "28 95% 56%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "28 95% 56%" },
      { name: "primary-foreground", value: "0 0% 100%" },
      { name: "primary-soft", value: "28 95% 24%" },
      { name: "accent", value: "26 92% 44%" },
      { name: "accent-contrast", value: "26 92% 70%" },
      { name: "accent-2", value: "168 72% 32%" },
      { name: "accent-foreground", value: "0 0% 100%" },
      { name: "accent-soft", value: "26 92% 18%" },
      { name: "glow", value: "28 96% 62%" },
      { name: "muted", value: "212 18% 22%" },
      { name: "muted-foreground", value: "212 20% 70%" },
      { name: "surface", value: "212 22% 12%" },
      { name: "surface-2", value: "212 20% 20%" },
      { name: "surface-vhs", value: "210 16% 6%" },
      { name: "surface-streak", value: "212 18% 16%" },
      { name: "shadow-color", value: "28 90% 42%" },
      { name: "shadow", value: "0 14px 36px hsl(var(--shadow-color) / 0.32)" },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
      },
      { name: "hero-illustration-opacity", value: "0.8" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-4) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.7" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.22" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.18" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.18" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.16" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-shadow", value: "0" },
      { name: "neo-glow-strength", value: "0.45" },
      { name: "glitch-intensity", value: "0.38" },
      { name: "glitch-fringe", value: "7deg" },
      { name: "glitch-static-opacity", value: "0.09" },
      { name: "lav-deep", value: "28 90% 56%" },
      { name: "icon-fg", value: "28 96% 74%" },
      { name: "success", value: "150 68% 46%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "150 68% 36% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "citrus-teal", value: "168 72% 42%" },
      { name: "backdrop-blob-1", value: "var(--ring)" },
      { name: "backdrop-blob-2", value: "var(--citrus-teal)" },
      { name: "backdrop-blob-3", value: "var(--ring)" },
      { name: "backdrop-blob-shadow", value: "var(--card)" },
      { name: "backdrop-grid-primary", value: "var(--ring)" },
      { name: "backdrop-grid-secondary", value: "var(--citrus-teal)" },
      { name: "backdrop-grid-opacity", value: "0.08" },
      { name: "grid-color", value: "var(--ring)" },
      { name: "grid-alpha", value: "0.08" },
      {
        name: "grid-size",
        value: "calc(var(--space-6) - var(--space-1))",
      },
      { name: "backdrop-drip-1", value: "var(--ring)" },
      { name: "backdrop-drip-2", value: "var(--citrus-teal)" },
      { name: "backdrop-drip-3", value: "var(--ring)" },
      { name: "backdrop-drip-shadow", value: "var(--card)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
      },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "glitch-noise-hover", value: "calc(var(--glitch-noise-level) * 1.3)" },
    ],
  },
  {
    id: "noir",
    label: "Noir",
    variables: [
      { name: "background", value: "352 68% 4%" },
      { name: "foreground", value: "0 0% 94%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "352 62% 8%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "352 44% 24%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "352 48% 12%" },
      { name: "ring", value: "356 86% 60%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "356 86% 60%" },
      { name: "primary-foreground", value: "0 0% 100%" },
      { name: "primary-soft", value: "356 86% 24%" },
      { name: "accent", value: "184 86% 35%" },
      { name: "accent-contrast", value: "184 90% 70%" },
      { name: "accent-2", value: "32 92% 38%" },
      { name: "accent-foreground", value: "0 0% 100%" },
      { name: "accent-soft", value: "184 86% 14%" },
      { name: "glow", value: "356 90% 62%" },
      { name: "muted", value: "352 34% 18%" },
      { name: "muted-foreground", value: "352 24% 68%" },
      { name: "surface", value: "352 56% 10%" },
      { name: "surface-2", value: "352 36% 18%" },
      { name: "surface-vhs", value: "352 64% 5%" },
      { name: "surface-streak", value: "352 30% 14%" },
      { name: "shadow-color", value: "356 70% 50%" },
      { name: "shadow", value: "0 18px 44px hsl(var(--shadow-color) / 0.38)" },
      {
        name: "shadow-inner-sm",
        value:
          "inset 0 var(--spacing-0-125) var(--spacing-0-5) hsl(var(--shadow-color) / 0.2)",
      },
      {
        name: "shadow-inner-md",
        value:
          "inset 0 var(--spacing-0-25) var(--spacing-1) hsl(var(--shadow-color) / 0.3)",
      },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.38)",
      },
      {
        name: "shadow-outer-lg",
        value: "0 var(--spacing-4) var(--spacing-7) hsl(var(--shadow-color) / 0.42)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.48)",
      },
      { name: "hero-illustration-opacity", value: "0.6" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-5) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.46" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.08" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.06" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.04" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.24" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.1" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.06" },
      { name: "glitch-intensity-backdrop-shadow", value: "0.06" },
      { name: "neo-glow-strength", value: "0.6" },
      { name: "glitch-intensity", value: "0.3" },
      { name: "glitch-fringe", value: "6deg" },
      { name: "glitch-static-opacity", value: "0.07" },
      { name: "glitch-noise-primary", value: "hsl(var(--ring) / 0.056)" },
      { name: "glitch-noise-secondary", value: "hsl(var(--accent) / 0.05)" },
      { name: "glitch-noise-contrast", value: "hsl(var(--foreground) / 0.048)" },
      { name: "lav-deep", value: "356 80% 62%" },
      { name: "icon-fg", value: "356 92% 72%" },
      { name: "success", value: "136 56% 52%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "136 56% 42% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "noir-red", value: "356 82% 58%" },
      { name: "noir-rose", value: "352 68% 54%" },
      { name: "noir-ink", value: "352 80% 6%" },
      { name: "noir-ruby", value: "12 76% 46%" },
      { name: "glow-primary", value: "hsl(var(--ring) / 0.58)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.52), 0 0 var(--spacing-3) hsl(var(--ring) / 0.24)",
      },
      { name: "blob-surface-1", value: "hsl(352 46% 12%)" },
      { name: "blob-surface-2", value: "hsl(352 38% 18%)" },
      { name: "blob-surface-3", value: "hsl(184 68% 20%)" },
      { name: "blob-surface-shadow", value: "hsl(356 72% 10% / 0.42)" },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "backdrop-blob-1", value: "var(--noir-red)" },
      { name: "backdrop-blob-2", value: "var(--noir-rose)" },
      { name: "backdrop-blob-3", value: "var(--noir-ruby)" },
      { name: "backdrop-blob-shadow", value: "var(--noir-ink)" },
      { name: "backdrop-grid-primary", value: "var(--noir-red)" },
      { name: "backdrop-grid-secondary", value: "var(--noir-red)" },
      { name: "backdrop-grid-opacity", value: "0.2" },
      { name: "grid-color", value: "var(--noir-red)" },
      { name: "grid-alpha", value: "0.2" },
      { name: "grid-size", value: "var(--space-5)" },
      { name: "backdrop-drip-1", value: "var(--noir-ink)" },
      { name: "backdrop-drip-2", value: "var(--noir-red)" },
      { name: "backdrop-drip-3", value: "var(--noir-ruby)" },
      { name: "backdrop-drip-shadow", value: "var(--noir-ink)" },
      {
        name: "glitch-noise-hover",
        value: "calc(var(--glitch-noise-level) * 1.35)",
      },
    ],
  },
  {
    id: "ocean",
    label: "Oceanic",
    variables: [
      { name: "background", value: "216 48% 8%" },
      { name: "foreground", value: "204 22% 96%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "218 34% 12%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "218 26% 24%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "218 28% 14%" },
      { name: "ring", value: "194 88% 58%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "194 88% 58%" },
      { name: "primary-foreground", value: "0 0% 100%" },
      { name: "primary-soft", value: "194 88% 18%" },
      { name: "accent", value: "204 92% 32%" },
      { name: "accent-contrast", value: "204 92% 68%" },
      { name: "accent-2", value: "230 78% 36%" },
      { name: "accent-foreground", value: "0 0% 100%" },
      { name: "accent-soft", value: "204 92% 14%" },
      { name: "glow", value: "194 94% 64%" },
      { name: "muted", value: "218 24% 17%" },
      { name: "muted-foreground", value: "218 16% 74%" },
      { name: "surface", value: "218 30% 12%" },
      { name: "surface-2", value: "218 26% 18%" },
      { name: "surface-vhs", value: "216 44% 7%" },
      { name: "surface-streak", value: "218 22% 15%" },
      { name: "shadow-color", value: "198 84% 52%" },
      { name: "shadow", value: "0 16px 40px hsl(var(--shadow-color) / 0.34)" },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
      },
      { name: "hero-illustration-opacity", value: "0.78" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-4) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.72" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.2" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.16" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.2" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.14" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-shadow", value: "0.16" },
      { name: "neo-glow-strength", value: "0.52" },
      { name: "glitch-intensity", value: "0.4" },
      { name: "glitch-fringe", value: "7deg" },
      { name: "glitch-static-opacity", value: "0.1" },
      { name: "lav-deep", value: "254 78% 68%" },
      { name: "icon-fg", value: "194 90% 72%" },
      { name: "success", value: "158 72% 48%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "158 72% 38% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "ocean-cyan", value: "194 88% 52%" },
      { name: "ocean-indigo", value: "230 72% 62%" },
      { name: "backdrop-blob-1", value: "var(--ring)" },
      { name: "backdrop-blob-2", value: "var(--ocean-cyan)" },
      { name: "backdrop-blob-3", value: "var(--ocean-indigo)" },
      { name: "backdrop-blob-shadow", value: "var(--card)" },
      { name: "backdrop-grid-primary", value: "var(--ring)" },
      { name: "backdrop-grid-secondary", value: "var(--ocean-indigo)" },
      { name: "backdrop-grid-opacity", value: "0.1" },
      { name: "grid-color", value: "var(--ring)" },
      { name: "grid-alpha", value: "0.12" },
      { name: "grid-size", value: "var(--space-6)" },
      { name: "backdrop-drip-1", value: "var(--ring)" },
      { name: "backdrop-drip-2", value: "var(--ocean-indigo)" },
      { name: "backdrop-drip-3", value: "var(--success)" },
      { name: "backdrop-drip-shadow", value: "var(--card)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
      },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "glitch-noise-hover", value: "calc(var(--glitch-noise-level) * 1.3)" },
    ],
  },
  {
    id: "kitten",
    label: "Kitten",
    variables: [
      { name: "background", value: "334 92% 3%" },
      { name: "foreground", value: "332 28% 97%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "334 86% 7%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "334 70% 22%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "334 72% 11%" },
      { name: "ring", value: "336 90% 56%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "336 90% 56%" },
      { name: "primary-foreground", value: "0 0% 100%" },
      { name: "primary-soft", value: "336 90% 24%" },
      { name: "accent", value: "340 86% 36%" },
      { name: "accent-contrast", value: "340 88% 74%" },
      { name: "accent-2", value: "194 90% 40%" },
      { name: "accent-foreground", value: "0 0% 100%" },
      { name: "accent-soft", value: "340 86% 14%" },
      { name: "glow", value: "336 94% 64%" },
      { name: "muted", value: "334 64% 18%" },
      { name: "muted-foreground", value: "334 26% 74%" },
      { name: "surface", value: "334 74% 9%" },
      { name: "surface-2", value: "334 60% 15%" },
      { name: "surface-vhs", value: "334 88% 4%" },
      { name: "surface-streak", value: "334 50% 12%" },
      { name: "shadow-color", value: "336 72% 48%" },
      { name: "shadow", value: "0 12px 30px hsl(var(--shadow-color) / 0.3)" },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
      },
      { name: "hero-illustration-opacity", value: "0.8" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-4) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.72" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.2" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.16" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.2" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.15" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.12" },
      { name: "glitch-intensity-backdrop-shadow", value: "0.16" },
      { name: "neo-glow-strength", value: "0.42" },
      { name: "glitch-intensity", value: "0.36" },
      { name: "glitch-fringe", value: "6deg" },
      { name: "glitch-static-opacity", value: "0.085" },
      { name: "lav-deep", value: "336 84% 64%" },
      { name: "icon-fg", value: "336 92% 72%" },
      { name: "success", value: "152 62% 48%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "152 62% 38% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "kitten-rose", value: "346 94% 42%" },
      { name: "kitten-pink", value: "342 96% 48%" },
      { name: "kitten-blush", value: "348 88% 88%" },
      { name: "backdrop-blob-1", value: "var(--kitten-rose)" },
      { name: "backdrop-blob-2", value: "var(--kitten-pink)" },
      { name: "backdrop-blob-3", value: "var(--kitten-blush)" },
      { name: "backdrop-blob-shadow", value: "var(--card)" },
      { name: "backdrop-grid-primary", value: "var(--kitten-rose)" },
      { name: "backdrop-grid-secondary", value: "var(--kitten-pink)" },
      { name: "backdrop-grid-opacity", value: "0.1" },
      { name: "grid-color", value: "var(--kitten-rose)" },
      { name: "grid-alpha", value: "0.12" },
      {
        name: "grid-size",
        value: "calc(var(--space-5) + var(--space-1))",
      },
      { name: "backdrop-drip-1", value: "var(--kitten-rose)" },
      { name: "backdrop-drip-2", value: "var(--kitten-pink)" },
      { name: "backdrop-drip-3", value: "var(--kitten-blush)" },
      { name: "backdrop-drip-shadow", value: "var(--card)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
      },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "glitch-noise-hover", value: "calc(var(--glitch-noise-level) * 1.3)" },
    ],
  },
  {
    id: "hardstuck",
    label: "Hardstuck",
    variables: [
      { name: "background", value: "120 58% 3%" },
      { name: "foreground", value: "120 60% 72%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "120 52% 6%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "120 42% 22%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "120 46% 9%" },
      { name: "ring", value: "120 100% 64%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "120 100% 64%" },
      { name: "primary-foreground", value: "0 0% 8%" },
      { name: "primary-soft", value: "120 100% 26%" },
      { name: "accent", value: "120 92% 58%" },
      { name: "accent-contrast", value: "120 92% 78%" },
      { name: "accent-2", value: "120 76% 22%" },
      { name: "accent-2-foreground", value: "120 32% 94%" },
      { name: "accent-foreground", value: "0 0% 8%" },
      { name: "text-on-accent", value: "hsl(var(--hardstuck-foreground))" },
      { name: "accent-soft", value: "120 90% 16%" },
      { name: "glow", value: "120 100% 70%" },
      { name: "ring-muted", value: "120 32% 22%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "warning", value: "43 96% 56%" },
      { name: "muted", value: "120 34% 11%" },
      { name: "muted-foreground", value: "120 18% 74%" },
      { name: "surface", value: "120 32% 8%" },
      { name: "surface-2", value: "120 34% 13%" },
      { name: "surface-vhs", value: "120 26% 4%" },
      { name: "surface-streak", value: "120 18% 11%" },
      { name: "shadow-color", value: "120 84% 44%" },
      { name: "shadow", value: "0 18px 46px hsl(var(--shadow-color) / 0.4)" },
      {
        name: "shadow-inner-sm",
        value:
          "inset 0 var(--spacing-0-125) var(--spacing-0-5) hsl(var(--shadow-color) / 0.16)",
      },
      {
        name: "shadow-inner-md",
        value:
          "inset 0 var(--spacing-0-25) var(--spacing-1) hsl(var(--shadow-color) / 0.24)",
      },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.3)",
      },
      {
        name: "shadow-outer-lg",
        value: "0 var(--spacing-4) var(--spacing-7) hsl(var(--shadow-color) / 0.34)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.42)",
      },
      { name: "hero-illustration-opacity", value: "0.58" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-5) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.44" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.1" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.06" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.04" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.22" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.08" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.06" },
      { name: "glitch-intensity-backdrop-shadow", value: "0.08" },
      { name: "neo-glow-strength", value: "0.58" },
      { name: "glitch-intensity", value: "0.28" },
      { name: "glitch-fringe", value: "5deg" },
      { name: "glitch-static-opacity", value: "0.07" },
      { name: "glitch-noise-primary", value: "hsl(var(--ring) / 0.055)" },
      { name: "glitch-noise-secondary", value: "hsl(var(--accent) / 0.05)" },
      {
        name: "glitch-noise-contrast",
        value: "hsl(var(--hardstuck-foreground) / 0.05)",
      },
      { name: "lav-deep", value: "120 90% 52%" },
      { name: "icon-fg", value: "120 92% 64%" },
      { name: "success", value: "120 94% 52%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "120 90% 42% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "hardstuck-forest", value: "120 70% 42%" },
      { name: "hardstuck-deep", value: "120 82% 8%" },
      { name: "glow-primary", value: "hsl(var(--ring) / 0.5)" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.48), 0 0 var(--spacing-3) hsl(var(--ring) / 0.2)",
      },
      { name: "blob-surface-1", value: "hsl(120 38% 14%)" },
      { name: "blob-surface-2", value: "hsl(120 44% 18%)" },
      { name: "blob-surface-3", value: "hsl(120 48% 24%)" },
      { name: "blob-surface-shadow", value: "hsl(120 72% 12% / 0.45)" },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      { name: "backdrop-blob-1", value: "var(--ring)" },
      { name: "backdrop-blob-2", value: "var(--hardstuck-forest)" },
      { name: "backdrop-blob-3", value: "var(--ring)" },
      { name: "backdrop-blob-shadow", value: "var(--hardstuck-deep)" },
      { name: "backdrop-grid-primary", value: "var(--ring)" },
      { name: "backdrop-grid-secondary", value: "var(--ring)" },
      { name: "backdrop-grid-opacity", value: "0.2" },
      { name: "grid-color", value: "var(--ring)" },
      { name: "grid-alpha", value: "0.2" },
      { name: "grid-size", value: "var(--space-5)" },
      { name: "backdrop-drip-1", value: "var(--hardstuck-deep)" },
      { name: "backdrop-drip-2", value: "var(--ring)" },
      { name: "backdrop-drip-3", value: "var(--hardstuck-forest)" },
      { name: "backdrop-drip-shadow", value: "var(--hardstuck-deep)" },
      {
        name: "glitch-noise-hover",
        value: "calc(var(--glitch-noise-level) * 1.35)",
      },
    ],
  },
  {
    id: "retro",
    label: "Retro",
    description: ["Neon grid inspired by retro-futurist arcades"],
    variables: [
      { name: "background", value: "258 78% 4%" },
      { name: "foreground", value: "196 28% 96%" },
      { name: "text", value: "var(--foreground)" },
      { name: "card", value: "260 68% 8%" },
      { name: "panel", value: "var(--card)" },
      { name: "border", value: "260 56% 22%" },
      { name: "line", value: "var(--border)" },
      { name: "input", value: "260 58% 12%" },
      { name: "ring", value: "304 100% 68%" },
      { name: "theme-ring", value: "hsl(var(--ring))" },
      { name: "primary", value: "304 100% 68%" },
      { name: "primary-foreground", value: "0 0% 8%" },
      { name: "primary-soft", value: "304 100% 24%" },
      { name: "accent", value: "304 100% 68%" },
      { name: "accent-contrast", value: "304 100% 85%" },
      { name: "accent-2", value: "188.7 89.6% 69.8%" },
      { name: "accent-3", value: "257.5 85.7% 72.5%" },
      { name: "accent-foreground", value: "0 0% 6%" },
      { name: "accent-soft", value: "304 100% 20%" },
      { name: "muted", value: "260 48% 18%" },
      { name: "muted-foreground", value: "260 22% 78%" },
      { name: "surface", value: "260 60% 10%" },
      { name: "surface-2", value: "260 50% 16%" },
      { name: "surface-vhs", value: "258 76% 5%" },
      { name: "surface-streak", value: "260 44% 13%" },
      { name: "shadow-color", value: "304 92% 56%" },
      {
        name: "shadow-inner-lg",
        value:
          "inset 0 var(--spacing-0-5) var(--spacing-2) hsl(var(--shadow-color) / 0.36)",
      },
      {
        name: "shadow-outer-xl",
        value: "0 var(--spacing-5) var(--spacing-8) hsl(var(--shadow-color) / 0.45)",
      },
      { name: "hero-illustration-opacity", value: "0.9" },
      {
        name: "hero-illustration-blur",
        value: "calc(var(--space-4) + var(--space-1))",
      },
      { name: "glitch-intensity-hero-rail", value: "0.82" },
      { name: "glitch-intensity-backdrop-blob-1", value: "0.26" },
      { name: "glitch-intensity-backdrop-blob-2", value: "0.22" },
      { name: "glitch-intensity-backdrop-blob-3", value: "0.18" },
      { name: "glitch-intensity-backdrop-drip-1", value: "0.34" },
      { name: "glitch-intensity-backdrop-drip-2", value: "0.3" },
      { name: "glitch-intensity-backdrop-drip-3", value: "0.26" },
      { name: "glitch-intensity-backdrop-shadow", value: "0.34" },
      { name: "glitch-intensity", value: "0.46" },
      { name: "glitch-static-opacity", value: "0.2" },
      { name: "lav-deep", value: "257.5 85.7% 72.5%" },
      { name: "icon-fg", value: "304 100% 80%" },
      { name: "success", value: "158 72% 48%" },
      { name: "success-foreground", value: "0 0% 100%" },
      { name: "success-glow", value: "158 72% 38% / 0.6" },
      { name: "warning", value: "43 96% 56%" },
      { name: "warning-foreground", value: "0 0% 100%" },
      { name: "danger", value: "0 84% 60%" },
      { name: "danger-foreground", value: "0 0% 100%" },
      { name: "glow", value: "304 100% 68%" },
      { name: "glow-active", value: "hsl(var(--accent-2))" },
      {
        name: "glow-ring",
        value:
          "0 0 0 calc(var(--spacing-0-5)) hsl(var(--ring) / 0.5), 0 0 var(--spacing-3) hsl(var(--ring) / 0.22)",
      },
      {
        name: "shadow-glow-sm",
        value: [
          "",
          "0 0 var(--spacing-2) hsl(var(--glow) / 0.7),",
          "0 0 var(--spacing-4) hsl(var(--accent-2) / 0.45)",
        ],
      },
      {
        name: "shadow-glow-md",
        value: [
          "",
          "0 0 var(--spacing-3) hsl(var(--glow) / 0.55),",
          "0 0 var(--spacing-5) hsl(var(--accent-2) / 0.4),",
          "0 0 var(--spacing-6) hsl(var(--accent-3) / 0.3)",
        ],
      },
      {
        name: "shadow-glow-lg",
        value: [
          "",
          "0 0 var(--spacing-4) hsl(var(--glow) / 0.5),",
          "0 0 var(--spacing-6) hsl(var(--accent-2) / 0.38),",
          "0 0 var(--spacing-7) hsl(var(--accent-3) / 0.28)",
        ],
      },
      {
        name: "shadow-glow-xl",
        value: [
          "",
          "0 var(--spacing-1) var(--spacing-5) hsl(var(--glow) / 0.45),",
          "0 var(--spacing-2) var(--spacing-7) hsl(var(--accent-2) / 0.32),",
          "0 var(--spacing-3) var(--spacing-8) hsl(var(--accent-3) / 0.24)",
        ],
      },
      { name: "backdrop-blob-1", value: "var(--accent-3)" },
      { name: "backdrop-blob-2", value: "var(--accent-2)" },
      { name: "backdrop-blob-3", value: "var(--accent)" },
      { name: "backdrop-blob-shadow", value: "var(--accent)" },
      { name: "backdrop-grid-primary", value: "var(--accent-3)" },
      { name: "backdrop-grid-secondary", value: "var(--accent-2)" },
      { name: "backdrop-grid-opacity", value: "0.18" },
      { name: "grid-color", value: "var(--accent-3)" },
      { name: "grid-alpha", value: "0.18" },
      {
        name: "grid-size",
        value: "calc(var(--space-6) - var(--space-1))",
      },
      { name: "backdrop-drip-1", value: "var(--accent-3)" },
      { name: "backdrop-drip-2", value: "var(--accent-2)" },
      { name: "backdrop-drip-3", value: "var(--accent)" },
      { name: "backdrop-drip-shadow", value: "var(--accent)" },
      { name: "blob-radius-soft", value: "calc(var(--radius-2xl) + var(--spacing-2))" },
      {
        name: "grid-lines",
        value: [
          "",
          "repeating-linear-gradient(",
          "  90deg,",
          "  hsl(var(--accent) / 0.18) 0 1px,",
          "  hsl(var(--accent-3) / 0.08) 1px 28px",
          ")",
        ],
      },
      {
        name: "scan-lines",
        value: [
          "",
          "repeating-linear-gradient(",
          "  0deg,",
          "  hsl(var(--accent-2) / 0.16) 0 1px,",
          "  transparent 1px 14px,",
          "  hsl(var(--accent-3) / 0.12) 14px 15px,",
          "  transparent 15px 28px",
          ")",
        ],
      },
      { name: "glitch-noise-hover", value: "calc(var(--glitch-noise-level) * 1.35)" },
    ],
  },
];

export const themes: ThemeDefinition[] = rawThemes.map(enforceCardContrast);
