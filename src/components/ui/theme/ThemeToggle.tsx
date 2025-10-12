// src/components/ui/theme/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button, Select, type SelectItem } from "@/components/ui";
import useMounted from "@/lib/useMounted";
import { useTheme } from "@/lib/theme-context";
import {
  VARIANTS,
  VARIANT_LABELS,
  BG_CLASSES,
  type Variant,
  type Background,
} from "@/lib/theme";

const BG_LABELS = ["Default", "Alt 1", "Alt 2", "VHS", "Streak"] as const;

type ThemeToggleProps = {
  className?: string;
  id?: string;
  ariaLabel?: string; // preferred
  "aria-label"?: string; // backward compat
  cycleDisabled?: boolean;
  cycleLoading?: boolean;
};

export function ThemeToggle({
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
  const { variant, bg } = state;
  const hasMultipleBackgrounds = BG_CLASSES.length > 1;
  const isCycleDisabled = cycleDisabled || !hasMultipleBackgrounds;
  const isCycleLoading = cycleLoading;
  const [announcement, setAnnouncement] = React.useState("");
  const prevVariantRef = React.useRef<Variant>(variant);
  const prevBgRef = React.useRef<Background>(bg);
  const initializedRef = React.useRef(false);
  const showFallback = !mounted;
  const groupLabel = `${aria} controls`;

  const setVariantPersist = React.useCallback(
    (v: Variant) => setState((prev) => ({ variant: v, bg: prev.bg })),
    [setState],
  );
  const handleChange = React.useCallback(
    (v: string) => setVariantPersist(v as Variant),
    [setVariantPersist],
  );
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

  React.useEffect(() => {
    if (!mounted) {
      prevVariantRef.current = variant;
      prevBgRef.current = bg;
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      prevVariantRef.current = variant;
      prevBgRef.current = bg;
      return;
    }

    if (variant !== prevVariantRef.current) {
      setAnnouncement(`Theme switched to ${VARIANT_LABELS[variant]}`);
    } else if (bg !== prevBgRef.current) {
      setAnnouncement(`Background switched to ${BG_LABELS[bg]}`);
    }

    prevVariantRef.current = variant;
    prevBgRef.current = bg;
  }, [variant, bg, mounted]);

  React.useEffect(() => {
    if (!announcement) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAnnouncement("");
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [announcement]);

  return (
    <div
      className={`flex items-center gap-[var(--space-2)] whitespace-nowrap ${className}`}
      role="group"
      aria-label={groupLabel}
    >
      {/* background cycle */}
      <Button
        id={id}
        variant="neo"
        size="sm"
        tactile
        className="shrink-0 px-[var(--space-2)]"
        aria-label={`${aria}: cycle background`}
        title={showFallback ? "Theme controls loading" : "Change background"}
        onClick={cycleBg}
        disabled={isCycleDisabled || showFallback}
        loading={isCycleLoading}
      >
        <ImageIcon aria-hidden className="h-[var(--space-4)] w-[var(--space-4)]" />
        <span className="sr-only">Cycle background</span>
      </Button>

      {/* dropdown — no visible title; uses aria label */}
      {showFallback ? (
        <Button
          variant="neo"
          size="sm"
          className="pointer-events-none !rounded-full !px-[var(--space-3)] !text-ui text-muted-foreground"
          aria-label={`${aria}: waiting for theme controls`}
          disabled
        >
          {aria}
        </Button>
      ) : (
        <Select
          variant="animated"
          ariaLabel={aria}
          items={items}
          value={variant}
          onChange={handleChange}
          size="sm"
          buttonClassName="!rounded-full !text-ui !w-auto"
          matchTriggerWidth={false}
          align="right"
          className="shrink-0"
        />
      )}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
