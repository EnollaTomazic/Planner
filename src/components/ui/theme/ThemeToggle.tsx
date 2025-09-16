// src/components/ui/theme/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Select, type SelectItem } from "@/components/ui";
import IconButton from "@/components/ui/primitives/IconButton";
import useMounted from "@/lib/useMounted";
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
  cycleDisabled?: boolean;
  cycleLoading?: boolean;
};

export default function ThemeToggle({
  className = "",
  id,
  ariaLabel,
  "aria-label": ariaLabelAttr,
  cycleDisabled = false,
  cycleLoading = false,
}: ThemeToggleProps) {
  const aria = ariaLabel ?? ariaLabelAttr ?? "Theme";

  const mounted = useMounted();
  const [state, setState] = useTheme();
  const { variant } = state;
  const hasMultipleBackgrounds = BG_CLASSES.length > 1;
  const isCycleDisabled = cycleDisabled || !hasMultipleBackgrounds;
  const isCycleLoading = cycleLoading;

  function setVariantPersist(v: Variant) {
    setState((prev) => ({ variant: v, bg: prev.bg }));
  }
  const items: SelectItem[] = React.useMemo(
    () =>
      VARIANTS.map((v) => ({
        value: v.id,
        label: v.label,
      })),
    [],
  );

  function cycleBg() {
    if (isCycleDisabled || isCycleLoading) {
      return;
    }
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

  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${className}`}>
      {/* background cycle */}
      <IconButton
        id={id}
        aria-label={`${aria}: cycle background`}
        title="Change background"
        onClick={cycleBg}
        disabled={isCycleDisabled}
        loading={isCycleLoading}
        size="sm"
        className="shrink-0"
      >
        <ImageIcon className="h-4 w-4" />
      </IconButton>

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
