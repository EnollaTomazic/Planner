
export type Variant =
  | "lg"
  | "aurora"
  | "citrus"
  | "noir"
  | "ocean"
  | "kitten"
  | "hardstuck";
export type Background = 0 | 1 | 2 | 3 | 4;
export interface ThemeState {
  variant: Variant;
  bg: Background;
}

export const THEME_STORAGE_KEY = "ui:theme";
export const THEME_BOOTSTRAP_SCRIPT_PATH = "/scripts/theme-bootstrap.js";

export const BG_CLASSES = [
  "",
  "bg-alt1",
  "bg-alt2",
  "bg-vhs",
  "bg-streak",
] as const;

const BG_CLASS_SET = new Set<string>(
  BG_CLASSES.filter((className) => className.length > 0),
);

export function resetThemeClasses(classList: DOMTokenList): void {
  const classesToRemove: string[] = [];

  classList.forEach((className) => {
    if (className.startsWith("theme-") || BG_CLASS_SET.has(className)) {
      classesToRemove.push(className);
    }
  });

  if (classesToRemove.length > 0) {
    classList.remove(...classesToRemove);
  }
}

export const COLOR_PALETTES = {
  aurora: ["aurora-g", "aurora-g-light", "aurora-p", "aurora-p-light"],
  neutrals: [
    "background",
    "bg",
    "foreground",
    "text",
    "card",
    "panel",
    "border",
    "line",
    "input",
    "ring",
    "muted",
    "muted-foreground",
    "surface",
    "surface-2",
    "surface-vhs",
    "surface-streak",
    "icon-fg",
  ],
  accents: [
    "accent",
    "accent-2",
    "accent-3",
    "accent-foreground",
    "danger",
    "success",
    "glow-strong",
    "glow-soft",
    "stat-good",
    "stat-warn",
    "stat-bad",
  ],
} as const;

export type ColorPalette = keyof typeof COLOR_PALETTES;

export const COLOR_TOKENS = [
  ...COLOR_PALETTES.neutrals,
  ...COLOR_PALETTES.accents,
  ...COLOR_PALETTES.aurora,
] as const;

export const VARIANTS: { id: Variant; label: string }[] = [
  { id: "lg", label: "Glitch" },
  { id: "aurora", label: "Aurora" },
  { id: "kitten", label: "Kitten" },
  { id: "ocean", label: "Oceanic" },
  { id: "citrus", label: "Citrus" },
  { id: "noir", label: "Noir" },
  { id: "hardstuck", label: "Hardstuck" },
];

export const VARIANT_LABELS: Record<Variant, string> = VARIANTS.reduce(
  (acc, { id, label }) => {
    acc[id] = label;
    return acc;
  },
  {} as Record<Variant, string>,
);

const VARIANT_ID_SET = new Set<Variant>(VARIANTS.map((variant) => variant.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isVariant(value: unknown): value is Variant {
  return typeof value === "string" && VARIANT_ID_SET.has(value as Variant);
}

function isBackground(value: unknown): value is Background {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < BG_CLASSES.length
  );
}

export function decodeThemeState(value: unknown): ThemeState | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawVariant = value["variant"];
  if (!isVariant(rawVariant)) {
    return null;
  }

  const rawBackground = value["bg"];
  const background = isBackground(rawBackground) ? rawBackground : 0;

  return { variant: rawVariant, bg: background };
}

export function defaultTheme(): ThemeState {
  return { variant: "lg", bg: 0 };
}

export function applyTheme({ variant, bg }: ThemeState): void {
  if (typeof document === "undefined") {
    return;
  }

  const { documentElement } = document;
  if (!documentElement) {
    return;
  }

  const { classList: cl, dataset } = documentElement;
  resetThemeClasses(cl);
  cl.add(`theme-${variant}`);
  const isValidBgIndex =
    Number.isInteger(bg) && bg >= 0 && bg < BG_CLASSES.length;
  if (isValidBgIndex && bg > 0) cl.add(BG_CLASSES[bg]);
  const pref = dataset.themePref === "system" ? "system" : "persisted";

  let prefersDark = true;
  if (pref === "system") {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        prefersDark = window
          .matchMedia("(prefers-color-scheme: dark)")
          .matches;
      }
    } catch {
      prefersDark = true;
    }
  }

  cl.toggle("dark", prefersDark);
  cl.remove("color-scheme-dark", "color-scheme-light");
  cl.add(prefersDark ? "color-scheme-dark" : "color-scheme-light");
}

