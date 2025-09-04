// src/components/ui/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Sun, Moon, Image as ImageIcon } from "lucide-react";
import AnimatedSelect, { DropItem } from "@/components/ui/selects/AnimatedSelect";

type Mode = "dark" | "light";
type Variant = "lg" | "glitch2" | "citrus" | "noir" | "ocean" | "rose";
type Background = 0 | 1 | 2 | 3 | 4 | 5;

type ThemeToggleProps = {
  className?: string;
  id?: string;
  ariaLabel?: string;          // preferred
  "aria-label"?: string;       // backward compat
};

const THEME_KEY = "lg-theme";
const MODE_KEY  = "lg-mode";
const VAR_KEY   = "lg-variant";
const BG_KEY    = "lg-bg";

const BG_CLASSES = ["", "bg-alt1", "bg-alt2", "bg-light", "bg-vhs", "bg-streak"] as const;

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "lg",       label: "Glitch" },
  { id: "glitch2",  label: "Glitch v2" },
  { id: "rose",     label: "Rose Quartz" },
  { id: "ocean",    label: "Oceanic" },
  { id: "citrus",   label: "Citrus" },
  { id: "noir",     label: "Noir" },
];

const LEGACY = ["theme-lg-dark","theme-lg-light","theme-cyber-void","theme-sunset-synth"];

function parseTheme(v: string | null): { variant: Variant; mode: Mode } {
  if (v === "theme-lg-light") return { variant: "lg", mode: "light" };
  if (v === "theme-lg-dark")  return { variant: "lg", mode: "dark" };
  if (v === "theme-glitch2")  return { variant: "glitch2", mode: "dark" };
  if (v === "theme-citrus")   return { variant: "citrus", mode: "dark" };
  if (v === "theme-noir")     return { variant: "noir", mode: "dark" };
  if (v === "theme-ocean")    return { variant: "ocean", mode: "dark" };
  if (v === "theme-rose")     return { variant: "rose", mode: "dark" };
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { variant: "lg", mode: prefersDark ? "dark" : "light" };
}
const asThemeString = (v: Variant, m: Mode) => (v === "lg" ? (m === "light" ? "theme-lg-light" : "theme-lg-dark") : `theme-${v}`);

function writeStorage(variant: Variant, mode: Mode, bg: Background) {
  try {
    localStorage.setItem(THEME_KEY, asThemeString(variant, mode));
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(VAR_KEY, variant);
    localStorage.setItem(BG_KEY, String(bg));
  } catch {}
}
function readStorage(): { variant: Variant; mode: Mode; bg: Background } {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t) {
      const { variant, mode } = parseTheme(t);
      const b = parseInt(localStorage.getItem(BG_KEY) || "0", 10);
      const bg: Background = b >= 1 && b <= 5 ? (b as Background) : 0;
      return { variant, mode, bg };
    }
    const m = localStorage.getItem(MODE_KEY) as Mode | null;
    const v = localStorage.getItem(VAR_KEY) as Variant | null;
      const b = parseInt(localStorage.getItem(BG_KEY) || "0", 10);
      const bg: Background = b >= 1 && b <= 5 ? (b as Background) : 0;
    if ((m === "dark" || m === "light") && v && VARIANTS.some(x => x.id === v)) return { variant: v, mode: m, bg };
  } catch {}
  const { variant, mode } = parseTheme(null);
  return { variant, mode, bg: 0 };
}
function applyClasses(variant: Variant, mode: Mode, bg: Background) {
  const cl = document.documentElement.classList;
  // remove previous theme classes
  cl.forEach(n => { if (n.startsWith("theme-")) cl.remove(n); });
  LEGACY.forEach(k => cl.remove(k));
  cl.add(`theme-${variant}`);

  BG_CLASSES.forEach(c => { if (c) cl.remove(c); });
  if (bg > 0) cl.add(BG_CLASSES[bg]);

  // mode only matters for LG
  if (variant === "lg") {
    if (mode === "dark") cl.add("dark"); else cl.remove("dark");
    if (mode === "light") cl.add("light"); else cl.remove("light");
  } else {
    cl.add("dark");
    cl.remove("light");
  }
}

export default function ThemeToggle({
  className = "",
  id,
  ariaLabel,
  "aria-label": ariaLabelAttr,
}: ThemeToggleProps) {
  const aria = ariaLabel ?? ariaLabelAttr ?? "Theme";

  const [mounted, setMounted] = React.useState(false);
  const [{ variant, mode, bg }, setState] = React.useState<{ variant: Variant; mode: Mode; bg: Background }>({
    variant: "lg",
    mode: "dark",
    bg: 0,
  });

  React.useEffect(() => {
    setMounted(true);
    const s = readStorage();
    setState(s);
    applyClasses(s.variant, s.mode, s.bg);
    writeStorage(s.variant, s.mode, s.bg);
    const onStorage = () => {
      const ns = readStorage();
      setState(ns);
      applyClasses(ns.variant, ns.mode, ns.bg);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const modeDisabled = variant !== "lg";
  const isDark = mode === "dark";

  function setVariantPersist(v: Variant) {
    const nextMode: Mode = v === "lg" ? mode : "dark";
    const next = { variant: v, mode: nextMode, bg };
    setState(next);
    writeStorage(next.variant, next.mode, next.bg);
    applyClasses(next.variant, next.mode, next.bg);
  }
  function toggleMode() {
    if (modeDisabled) return;
    const next: Mode = isDark ? "light" : "dark";
    const s = { variant, mode: next, bg };
    setState(s);
    writeStorage(s.variant, s.mode, s.bg);
    applyClasses(s.variant, s.mode, s.bg);
  }

  function cycleBg() {
      const next: Background = ((bg + 1) % BG_CLASSES.length) as Background;
    const s = { variant, mode, bg: next };
    setState(s);
    writeStorage(s.variant, s.mode, s.bg);
    applyClasses(s.variant, s.mode, s.bg);
  }

  if (!mounted) {
    return <span aria-hidden className={`inline-block h-9 w-9 rounded-full bg-[hsl(var(--input))] ${className}`} />;
  }

  const items: DropItem[] = VARIANTS.map(v => ({ value: v.id, label: v.label }));

  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${className}`}>
      {/* compact mode toggle */}
      <button
        id={id}
        type="button"
        aria-label={modeDisabled ? `${aria} mode (fixed)` : `${aria}: toggle light/dark`}
        aria-pressed={isDark}
        disabled={modeDisabled}
        onClick={toggleMode}
        title={modeDisabled ? "This palette uses dark tokens" : isDark ? "Dark → Light" : "Light → Dark"}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0",
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "hover:shadow-[0_0_12px_hsl(var(--ring)/.35)] focus:outline-none",
          "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          modeDisabled ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* background cycle */}
      <button
        type="button"
        aria-label={`${aria}: cycle background`}
        onClick={cycleBg}
        title="Change background"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0 border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-[0_0_12px_hsl(var(--ring)/.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
      >
        <ImageIcon className="h-4 w-4" />
      </button>

      {/* dropdown — no visible title; uses aria label */}
      <AnimatedSelect
        ariaLabel={aria}
        items={items}
        value={variant}
        onChange={(v) => setVariantPersist(v as Variant)}
        buttonClassName="!h-9 !px-3 !rounded-full !text-sm !w-auto"
        matchTriggerWidth={false}
        align="right"
        className="shrink-0"
      />
    </div>
  );
}
