interface AccentColorPalette {
  readonly accent1: string;
  readonly accent1Soft: string;
  readonly accent1Contrast: string;
  readonly accent1Foreground: string;
  readonly accent2: string;
  readonly accent2Foreground: string;
  readonly accent3: string;
  readonly background: string;
  readonly panel: string;
  readonly surface: string;
  readonly border: string;
  readonly glow: string;
}

type AccentTokenKey = keyof AccentColorPalette;

type AccentTokenFormat = "hsl-var" | "var" | "raw";

interface AccentTokenDescriptor {
  readonly cssVar?: string;
  readonly fallback: string;
  readonly format?: AccentTokenFormat;
}

type AccentTokenMap = Record<AccentTokenKey, AccentTokenDescriptor>;

export type AccentTone =
  | "accent"
  | "primary"
  | "supportive"
  | "life"
  | "warning"
  | "danger";

const NEUTRAL_TOKENS: Pick<AccentTokenMap, "background" | "panel" | "surface" | "border"> = {
  background: { cssVar: "--background", fallback: "247 32% 14%" },
  panel: { cssVar: "--panel", fallback: "249 28% 21%" },
  surface: { cssVar: "--surface", fallback: "248 24% 18%" },
  border: { cssVar: "--border", fallback: "253 26% 28%" },
};

const ACCENT_PRESETS: Record<AccentTone, AccentTokenMap> = {
  accent: {
    accent1: { cssVar: "--accent-1", fallback: "276 88% 62%" },
    accent1Soft: { cssVar: "--accent-1-soft", fallback: "276 88% 22%" },
    accent1Contrast: { cssVar: "--accent-1-contrast", fallback: "276 92% 88%" },
    accent1Foreground: { cssVar: "--accent-1-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--accent-2", fallback: "168 96% 56%" },
    accent2Foreground: { cssVar: "--accent-2-foreground", fallback: "0 0% 100%" },
    accent3: { cssVar: "--accent-3", fallback: "318 82% 60%" },
    glow: { cssVar: "--glow", fallback: "296 96% 56%" },
    ...NEUTRAL_TOKENS,
  },
  primary: {
    accent1: { cssVar: "--primary", fallback: "262 88% 60%" },
    accent1Soft: { cssVar: "--primary-soft", fallback: "262 88% 20%" },
    accent1Contrast: { cssVar: "--primary-foreground", fallback: "0 0% 100%" },
    accent1Foreground: { cssVar: "--primary-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--primary", fallback: "262 88% 60%" },
    accent2Foreground: { cssVar: "--primary-foreground", fallback: "0 0% 100%" },
    accent3: { cssVar: "--primary-soft", fallback: "262 88% 20%" },
    glow: {
      cssVar: "--glow-primary",
      fallback: "hsl(var(--primary, 262 88% 60%) / 0.55)",
      format: "var",
    },
    ...NEUTRAL_TOKENS,
  },
  supportive: {
    accent1: { cssVar: "--accent-2", fallback: "168 96% 56%" },
    accent1Soft: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--accent-2, 168 96% 56%)) 28%, transparent)",
    },
    accent1Contrast: { cssVar: "--accent-2-foreground", fallback: "0 0% 100%" },
    accent1Foreground: { cssVar: "--accent-2-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--accent-2", fallback: "168 96% 56%" },
    accent2Foreground: { cssVar: "--accent-2-foreground", fallback: "0 0% 100%" },
    accent3: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--accent-2, 168 96% 56%)) 55%, transparent)",
    },
    glow: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--accent-2, 168 96% 56%)) 60%, transparent)",
    },
    ...NEUTRAL_TOKENS,
  },
  life: {
    accent1: { cssVar: "--success", fallback: "160 72% 48%" },
    accent1Soft: {
      cssVar: "--success-soft",
      fallback: "var(--success, 160 72% 48%) / 0.2",
    },
    accent1Contrast: { cssVar: "--success-foreground", fallback: "0 0% 100%" },
    accent1Foreground: { cssVar: "--success-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--success", fallback: "160 72% 48%" },
    accent2Foreground: { cssVar: "--success-foreground", fallback: "0 0% 100%" },
    accent3: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--success, 160 72% 48%)) 42%, transparent)",
    },
    glow: { cssVar: "--success-glow", fallback: "160 72% 38% / 0.6" },
    ...NEUTRAL_TOKENS,
  },
  warning: {
    accent1: { cssVar: "--warning", fallback: "43 96% 56%" },
    accent1Soft: {
      cssVar: "--warning-soft",
      fallback: "var(--warning, 43 96% 56%) / 0.1",
    },
    accent1Contrast: { cssVar: "--warning-foreground", fallback: "0 0% 100%" },
    accent1Foreground: { cssVar: "--warning-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--warning", fallback: "43 96% 56%" },
    accent2Foreground: { cssVar: "--warning-foreground", fallback: "0 0% 100%" },
    accent3: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--warning, 43 96% 56%)) 50%, transparent)",
    },
    glow: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--warning, 43 96% 56%)) 60%, transparent)",
    },
    ...NEUTRAL_TOKENS,
  },
  danger: {
    accent1: { cssVar: "--danger", fallback: "0 84% 60%" },
    accent1Soft: {
      format: "raw",
      fallback: "hsl(var(--danger, 0 84% 60%) / 0.22)",
    },
    accent1Contrast: { cssVar: "--danger-foreground", fallback: "0 0% 100%" },
    accent1Foreground: { cssVar: "--danger-foreground", fallback: "0 0% 100%" },
    accent2: { cssVar: "--danger", fallback: "0 84% 60%" },
    accent2Foreground: { cssVar: "--danger-foreground", fallback: "0 0% 100%" },
    accent3: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--danger, 0 84% 60%)) 48%, transparent)",
    },
    glow: {
      format: "raw",
      fallback:
        "color-mix(in oklab, hsl(var(--danger, 0 84% 60%)) 58%, transparent)",
    },
    ...NEUTRAL_TOKENS,
  },
};

const resolveToken = ({ cssVar, fallback, format }: AccentTokenDescriptor): string => {
  if (format === "raw") {
    return fallback;
  }
  if (!cssVar) {
    return fallback;
  }
  if (format === "var") {
    return `var(${cssVar}, ${fallback})`;
  }
  return `hsl(var(${cssVar}, ${fallback}))`;
};

export type AccentColors = AccentColorPalette;

export function getAccentColors(tone: AccentTone = "accent"): AccentColorPalette {
  const preset = ACCENT_PRESETS[tone] ?? ACCENT_PRESETS.accent;

  const entries = Object.entries(preset) as Array<
    [AccentTokenKey, AccentTokenDescriptor]
  >;

  return entries.reduce<AccentColorPalette>((acc, [key, descriptor]) => {
    return { ...acc, [key]: resolveToken(descriptor) };
  }, {} as AccentColorPalette);
}
