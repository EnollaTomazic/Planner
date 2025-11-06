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

const FALLBACK_TOKENS = {
  accent1: "276 88% 62%",
  accent1Soft: "276 88% 22%",
  accent1Contrast: "276 92% 88%",
  accent1Foreground: "0 0% 100%",
  accent2: "168 96% 56%",
  accent2Foreground: "0 0% 100%",
  accent3: "318 82% 60%",
  background: "247 32% 14%",
  panel: "249 28% 21%",
  surface: "248 24% 18%",
  border: "253 26% 28%",
  glow: "296 96% 56%",
} as const;

const TOKEN_TO_CSS_VAR: Record<keyof AccentColorPalette, string> = {
  accent1: "--accent-1",
  accent1Soft: "--accent-1-soft",
  accent1Contrast: "--accent-1-contrast",
  accent1Foreground: "--accent-1-foreground",
  accent2: "--accent-2",
  accent2Foreground: "--accent-2-foreground",
  accent3: "--accent-3",
  background: "--background",
  panel: "--panel",
  surface: "--surface",
  border: "--border",
  glow: "--glow",
};

const toHslVar = (token: keyof AccentColorPalette): string => {
  const cssVar = TOKEN_TO_CSS_VAR[token];
  const fallback = FALLBACK_TOKENS[token];
  return `hsl(var(${cssVar}, ${fallback}))`;
};

export type AccentColors = AccentColorPalette;

export function getAccentColors(): AccentColorPalette {
  return {
    accent1: toHslVar("accent1"),
    accent1Soft: toHslVar("accent1Soft"),
    accent1Contrast: toHslVar("accent1Contrast"),
    accent1Foreground: toHslVar("accent1Foreground"),
    accent2: toHslVar("accent2"),
    accent2Foreground: toHslVar("accent2Foreground"),
    accent3: toHslVar("accent3"),
    background: toHslVar("background"),
    panel: toHslVar("panel"),
    surface: toHslVar("surface"),
    border: toHslVar("border"),
    glow: toHslVar("glow"),
  } satisfies AccentColorPalette;
}
