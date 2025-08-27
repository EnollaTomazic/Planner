// src/components/ui/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import AnimatedSelect, { DropItem } from "@/components/ui/selects/AnimatedSelect";

type Mode = "dark" | "light";
type Variant = "lg" | "citrus" | "noir" | "ocean" | "rose";

type ThemeToggleProps = {
  className?: string;
  id?: string;
  ariaLabel?: string;          // preferred
  "aria-label"?: string;       // backward compat
};

const THEME_KEY = "lg-theme";
const MODE_KEY  = "lg-mode";
const VAR_KEY   = "lg-variant";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "lg",     label: "Glitch" },
  { id: "rose",   label: "Rose Quartz" },
  { id: "ocean",  label: "Oceanic" },
  { id: "citrus", label: "Citrus" },
  { id: "noir",   label: "Noir" },
];

const LEGACY = ["theme-lg-dark","theme-lg-light","theme-cyber-void","theme-sunset-synth"];

function parseTheme(v: string | null): { variant: Variant; mode: Mode } {
  if (v === "theme-lg-light") return { variant: "lg", mode: "light" };
  if (v === "theme-lg-dark")  return { variant: "lg", mode: "dark" };
  if (v === "theme-citrus")   return { variant: "citrus", mode: "dark" };
  if (v === "theme-noir")     return { variant: "noir", mode: "dark" };
  if (v === "theme-ocean")    return { variant: "ocean", mode: "dark" };
  if (v === "theme-rose")     return { variant: "rose", mode: "dark" };
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { variant: "lg", mode: prefersDark ? "dark" : "light" };
}
const asThemeString = (v: Variant, m: Mode) => (v === "lg" ? (m === "light" ? "theme-lg-light" : "theme-lg-dark") : `theme-${v}`);

function writeStorage(variant: Variant, mode: Mode) {
  try {
    localStorage.setItem(THEME_KEY, asThemeString(variant, mode));
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(VAR_KEY, variant);
  } catch {}
}
function readStorage(): { variant: Variant; mode: Mode } {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t) return parseTheme(t);
    const m = localStorage.getItem(MODE_KEY) as Mode | null;
    const v = localStorage.getItem(VAR_KEY) as Variant | null;
    if ((m === "dark" || m === "light") && v && VARIANTS.some(x => x.id === v)) return { variant: v, mode: m };
  } catch {}
  return parseTheme(null);
}
function applyClasses(variant: Variant, mode: Mode) {
  const cl = document.documentElement.classList;
  // remove previous theme classes
  cl.forEach(n => { if (n.startsWith("theme-")) cl.remove(n); });
  LEGACY.forEach(k => cl.remove(k));
  cl.add(`theme-${variant}`);

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
  const [{ variant, mode }, setState] = React.useState<{ variant: Variant; mode: Mode }>({
    variant: "lg",
    mode: "dark",
  });

  React.useEffect(() => {
    setMounted(true);
    const s = readStorage();
    setState(s);
    applyClasses(s.variant, s.mode);
    writeStorage(s.variant, s.mode);
    const onStorage = () => {
      const ns = readStorage();
      setState(ns);
      applyClasses(ns.variant, ns.mode);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const modeDisabled = variant !== "lg";
  const isDark = mode === "dark";

  function setVariantPersist(v: Variant) {
    const nextMode: Mode = v === "lg" ? mode : "dark";
    const next = { variant: v, mode: nextMode };
    setState(next);
    writeStorage(next.variant, next.mode);
    applyClasses(next.variant, next.mode);
  }
  function toggleMode() {
    if (modeDisabled) return;
    const next: Mode = isDark ? "light" : "dark";
    const s = { variant, mode: next };
    setState(s);
    writeStorage(s.variant, s.mode);
    applyClasses(s.variant, s.mode);
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

      {/* dropdown — no visible title; uses aria label */}
      <AnimatedSelect
        ariaLabel={aria}
        items={items}
        value={variant}
        onChange={(v) => setVariantPersist(v as Variant)}
        buttonClassName="!h-9 !px-3 !rounded-[9999px] !text-sm"
        matchTriggerWidth={false}
        align="right"
        className="shrink-0"
      />
    </div>
  );
}
