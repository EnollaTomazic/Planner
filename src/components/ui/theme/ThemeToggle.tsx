// src/components/ui/theme/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Select, type SelectItem } from "@/components/ui";
import { useTheme } from "@/lib/theme-context";
import {
  VARIANTS,
  BG_CLASSES,
  type Variant,
  type Background,
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
  const [state, setState] = useTheme();
  const { variant } = state;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function setVariantPersist(v: Variant) {
    setState((prev) => ({ variant: v, bg: prev.bg }));
  }
  function cycleBg() {
    setState((prev) => ({
      ...prev,
      bg: ((prev.bg + 1) % BG_CLASSES.length) as Background,
    }));
  }

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-block h-9 w-9 rounded-full bg-input ${className}`}
      />
    );
  }

  const items: SelectItem[] = VARIANTS.map((v) => ({
    value: v.id,
    label: v.label,
  }));

  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${className}`}>
      {/* background cycle */}
      <button
        id={id}
        type="button"
        aria-label={`${aria}: cycle background`}
        onClick={cycleBg}
        title="Change background"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0 border border-border bg-card opacity-70 hover:opacity-100 focus-visible:opacity-100 hover:shadow-[0_0_12px_hsl(var(--ring)/.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ImageIcon className="h-4 w-4" />
      </button>

      {/* dropdown — no visible title; uses aria label */}
      <Select
        variant="animated"
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
