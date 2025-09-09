// src/components/ui/theme/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Sun, Moon, Image as ImageIcon } from "lucide-react";
import AnimatedSelect, { DropItem } from "@/components/ui/selects/AnimatedSelect";
import { usePersistentState } from "@/lib/db";
import {
  applyTheme,
  defaultTheme,
  THEME_STORAGE_KEY,
  VARIANTS,
  BG_CLASSES,
  ThemeState,
  Variant,
  Background,
} from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  id?: string;
  ariaLabel?: string; // preferred
  "aria-label"?: string; // backward compat
};

export default function ThemeToggle({
  className = "",
  id,
  ariaLabel,
  "aria-label": ariaLabelAttr,
}: ThemeToggleProps) {
  const aria = ariaLabel ?? ariaLabelAttr ?? "Theme";

  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    defaultTheme(),
  );
  const { variant, mode } = state;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    applyTheme(state);
  }, [state]);

  const modeDisabled = variant !== "lg";
  const isDark = mode === "dark";

  function setVariantPersist(v: Variant) {
    setState((prev) => ({ variant: v, mode: v === "lg" ? prev.mode : "dark", bg: prev.bg }));
  }
  function toggleMode() {
    if (modeDisabled) return;
    setState((prev) => ({ ...prev, mode: prev.mode === "dark" ? "light" : "dark" }));
  }
  function cycleBg() {
    setState((prev) => ({ ...prev, bg: ((prev.bg + 1) % BG_CLASSES.length) as Background }));
  }

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-block h-9 w-9 rounded-full bg-[hsl(var(--input))] ${className}`}
      />
    );
  }

  const items: DropItem[] = VARIANTS.map((v) => ({ value: v.id, label: v.label }));

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
          "hover:shadow-[0_0_12px_hsl(var(--ring)/.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0 border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-[0_0_12px_hsl(var(--ring)/.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
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

