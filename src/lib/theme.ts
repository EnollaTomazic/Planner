import { readLocal, writeLocal } from "./db";

export type Mode = "dark" | "light";
export type Variant = "lg" | "aurora" | "citrus" | "noir" | "ocean" | "rose" | "hardstuck";
export type Background = 0 | 1 | 2 | 3 | 4 | 5;
export interface ThemeState {
  variant: Variant;
  mode: Mode;
  bg: Background;
}

export const THEME_STORAGE_KEY = "ui:theme";

export const BG_CLASSES = ["", "bg-alt1", "bg-alt2", "bg-light", "bg-vhs", "bg-streak"] as const;

export const COLOR_TOKENS = [
  "background",
  "foreground",
  "text",
  "card",
  "panel",
  "border",
  "line",
  "input",
  "ring",
  "accent",
  "accent-2",
  "accent-foreground",
  "muted",
  "muted-foreground",
  "surface",
  "surface-2",
  "surface-vhs",
  "surface-streak",
  "danger",
  "success",
  "glow-strong",
  "glow-soft",
  "aurora-g",
  "aurora-g-light",
  "aurora-p",
  "aurora-p-light",
  "icon-fg",
] as const;

export const VARIANTS: { id: Variant; label: string }[] = [
  { id: "lg", label: "Glitch" },
  { id: "aurora", label: "Aurora" },
  { id: "rose", label: "Rose Quartz" },
  { id: "ocean", label: "Oceanic" },
  { id: "citrus", label: "Citrus" },
  { id: "noir", label: "Noir" },
  { id: "hardstuck", label: "Hardstuck" },
];

export function defaultTheme(): ThemeState {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { variant: "lg", mode: prefersDark ? "dark" : "light", bg: 0 };
}

export function readTheme(): ThemeState {
  return readLocal<ThemeState>(THEME_STORAGE_KEY) ?? defaultTheme();
}

export function writeTheme(state: ThemeState) {
  writeLocal(THEME_STORAGE_KEY, state);
}

export function applyTheme({ variant, mode, bg }: ThemeState) {
  const cl = document.documentElement.classList;
  cl.forEach((n) => {
    if (n.startsWith("theme-")) cl.remove(n);
  });
  cl.add(`theme-${variant}`);

  BG_CLASSES.forEach((c) => {
    if (c) cl.remove(c);
  });
  if (bg > 0) cl.add(BG_CLASSES[bg]);

  if (variant === "lg") {
    if (mode === "dark") cl.add("dark");
    else cl.remove("dark");
    if (mode === "light") cl.add("light");
    else cl.remove("light");
  } else {
    cl.add("dark");
    cl.remove("light");
  }
}

export function themeBootstrapScript(): string {
  return `((function(){
    try {
      var STORAGE_PREFIX = "13lr:";
      function parseJSON(raw){ if(!raw) return null; try{return JSON.parse(raw);}catch{return null;} }
      function readLocal(key){ try{ return parseJSON(localStorage.getItem(STORAGE_PREFIX+key)); } catch { return null; } }
      function writeLocal(key,val){ try{ localStorage.setItem(STORAGE_PREFIX+key, JSON.stringify(val)); } catch {} }
      var key = "${THEME_STORAGE_KEY}";
      var data = readLocal(key);
      if(!data){
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        data = { variant: 'lg', mode: prefersDark ? 'dark' : 'light', bg: 0 };
        writeLocal(key, data);
      }
      var BG_CLASSES = ${JSON.stringify(BG_CLASSES)};
      var cl = document.documentElement.classList;
      Array.from(cl).forEach(function(n){ if(n.indexOf('theme-')===0) cl.remove(n); });
      cl.add('theme-' + data.variant);
      BG_CLASSES.forEach(function(c){ if(c) cl.remove(c); });
      if(data.bg>0) cl.add(BG_CLASSES[data.bg]);
      if(data.variant==='lg'){
        if(data.mode==='dark') cl.add('dark'); else cl.remove('dark');
        if(data.mode==='light') cl.add('light'); else cl.remove('light');
      } else {
        cl.add('dark');
        cl.remove('light');
      }
    } catch { }
  })())`;
}

