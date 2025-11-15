"use client";

import * as React from "react";

import { useRovingTabState } from "@/components/tabs/useRovingTabState";
import { GlitchSegmentedButton } from "@/components/ui/primitives/GlitchSegmentedButton";
import {
  GlitchSegmentedGroup,
  type GlitchSegmentedGroupProps,
} from "@/components/ui/primitives/GlitchSegmentedGroup";
import { defaultTheme, VARIANTS, type Variant } from "@/lib/theme";
import { useOptionalTheme } from "@/lib/theme-context";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

import styles from "./ThemeSelector.module.css";

type Align = NonNullable<GlitchSegmentedGroupProps["align"]>;
type Size = NonNullable<GlitchSegmentedGroupProps["size"]>;

export interface ThemeSelectorProps {
  id?: string;
  className?: string;
  size?: Size;
  align?: Align;
  disabled?: boolean;
  value?: Variant;
  defaultValue?: Variant;
  onValueChange?: (variant: Variant) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  syncTheme?: boolean;
}

const rovingItems = VARIANTS.map(({ id }) => ({ key: id }));

export function ThemeSelector({
  id,
  className,
  size = "md",
  align = "start",
  disabled = false,
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  syncTheme = true,
}: ThemeSelectorProps) {
  const themeContext = useOptionalTheme();
  const themeState = themeContext?.[0];
  const setThemeState = themeContext?.[1];
  const reduceMotion = usePrefersReducedMotion();
  const shouldGlitch = !reduceMotion;

  const fallbackVariant = React.useMemo(() => defaultTheme().variant, []);
  const initialVariantRef = React.useRef<Variant>(
    value ?? themeState?.variant ?? defaultValue ?? fallbackVariant,
  );
  const [internalVariant, setInternalVariant] = React.useState<Variant>(
    initialVariantRef.current,
  );

  React.useEffect(() => {
    if (!themeState && value === undefined && defaultValue !== undefined) {
      setInternalVariant(defaultValue);
    }
  }, [themeState, value, defaultValue]);

  const activeVariant = value ?? themeState?.variant ?? internalVariant;
  const resolvedVariant = activeVariant ?? fallbackVariant;

  const handleVariantChange = React.useCallback(
    (next: Variant) => {
      if (disabled || next === resolvedVariant) {
        return;
      }

      onValueChange?.(next);

      if (!themeState && value === undefined) {
        setInternalVariant(next);
      }

      if (syncTheme && setThemeState) {
        setThemeState((previous) =>
          previous.variant === next ? previous : { ...previous, variant: next },
        );
      }
    },
    [disabled, resolvedVariant, onValueChange, themeState, value, syncTheme, setThemeState],
  );

  const items = React.useMemo(
    () =>
      rovingItems.map((item) => ({
        ...item,
        disabled,
      })),
    [disabled],
  );

  const { activeKey, registerTab, setActiveValue, onKeyDown } =
    useRovingTabState<Variant, { key: Variant; disabled?: boolean }>({
      items,
      value: resolvedVariant,
      onValueChange: handleVariantChange,
    });

  const labelProps: {
    "aria-label"?: string;
    "aria-labelledby"?: string;
  } = {};

  if (ariaLabelledby) {
    labelProps["aria-labelledby"] = ariaLabelledby;
    if (ariaLabel) {
      labelProps["aria-label"] = ariaLabel;
    }
  } else if (ariaLabel) {
    labelProps["aria-label"] = ariaLabel;
  }

  return (
    <GlitchSegmentedGroup
      id={id}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      aria-describedby={ariaDescribedby}
      size={size}
      align={align}
      className={cn(styles.root, className)}
      onKeyDown={onKeyDown}
      {...labelProps}
    >
      {VARIANTS.map(({ id: variantId, label }) => {
        const selected = variantId === activeKey;
        const isDisabled = disabled;
        return (
          <GlitchSegmentedButton
            key={variantId}
            ref={(node) => registerTab(variantId, node)}
            role="radio"
            aria-checked={selected}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : selected ? 0 : -1}
            selected={selected}
            disabled={isDisabled}
            glitch={shouldGlitch && !isDisabled}
            className={styles.option}
            onClick={(event) => {
              if (isDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              setActiveValue(variantId);
            }}
          >
            <span className={styles.preview} aria-hidden>
              <span className={styles.previewAccent} />
              <span className={styles.previewSheen} />
              {shouldGlitch ? <span className={styles.previewNoise} /> : null}
            </span>
            <span className={styles.label}>{label}</span>
          </GlitchSegmentedButton>
        );
      })}
    </GlitchSegmentedGroup>
  );
}
