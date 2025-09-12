import { readLocal, writeLocal, localBootstrapScript } from "./local-bootstrap";

const STORAGE_PREFIX = "noxis-planner:";
function createStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

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

export const BG_CLASSES = [
  "",
  "bg-alt1",
  "bg-alt2",
  "bg-vhs",
  "bg-streak",
] as const;

export const COLOR_PALETTES = {
  aurora: ["aurora-g", "aurora-g-light", "aurora-p", "aurora-p-light"],
  neutrals: [
    "background",
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
    "accent-foreground",
    "danger",
    "success",
    "glow-strong",
    "glow-soft",
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

export function defaultTheme(): ThemeState {
  return { variant: "lg", bg: 0 };
}

export function readTheme(): ThemeState {
  const data = readLocal<ThemeState>(createStorageKey(THEME_STORAGE_KEY));
  return data ? { variant: data.variant, bg: data.bg } : defaultTheme();
}

export function writeTheme(state: ThemeState) {
  writeLocal(createStorageKey(THEME_STORAGE_KEY), state);
}

export function applyTheme({ variant, bg }: ThemeState) {
  const cl = document.documentElement.classList;
  cl.forEach((n) => {
    if (n.startsWith("theme-")) cl.remove(n);
  });
  cl.add(`theme-${variant}`);

  BG_CLASSES.forEach((c) => {
    if (c) cl.remove(c);
  });
  if (bg > 0) cl.add(BG_CLASSES[bg]);
  cl.add("dark");
}

export function themeBootstrapScript(): string {
  return `((() => {
    try {
      ${localBootstrapScript()}
      const key = "${createStorageKey(THEME_STORAGE_KEY)}";
      let data = readLocal(key);
      if (!data) {
        data = { variant: "lg", bg: 0 };
        writeLocal(key, data);
      }
      const BG_CLASSES = ${JSON.stringify(BG_CLASSES)};
      const cl = document.documentElement.classList;
      Array.from(cl).forEach((n) => {
        if (n.indexOf("theme-") === 0) cl.remove(n);
      });
      cl.add("theme-" + data.variant);
      BG_CLASSES.forEach((c) => {
        if (c) cl.remove(c);
      });
      if (data.bg > 0) cl.add(BG_CLASSES[data.bg]);
      cl.add("dark");
    } catch {}
  })())`;
}
