// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import { Field, type FieldVariant } from "./Field";
import { type GlitchOverlayToken } from "./BlobContainer";
import styles from "./Input.module.css";

export type InputRingTone =
  | "accent"
  | "danger"
  | "primary"
  | "success"
  | "warning";

const RING_TONE_CLASS_MAP: Record<InputRingTone, string> = {
  accent: styles.ringToneAccent,
  danger: styles.ringToneDanger,
  primary: styles.ringTonePrimary,
  success: styles.ringToneSuccess,
  warning: styles.ringToneWarning,
};

export type InputSize = "sm" | "md" | "lg" | "xl";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "height" | "style"
> & {
  /** Visual height of the control (defaults to medium) */
  height?: InputSize | number;
  /** When true, increases left padding for icons */
  indent?: boolean;
  /** Optional className for the inner <input> element */
  inputClassName?: string;
  /** Reserve space for a trailing slot even if no children are provided */
  hasEndSlot?: boolean;
  /** Optional loading state forwarded via `data-loading` */
  "data-loading"?: string | boolean | number;
  /** Overrides the focus ring tone by mapping to semantic tokens */
  ringTone?: InputRingTone;
  /** Enables the glitch overlay treatment */
  glitch?: boolean;
  /**
   * Overrides the text surfaced in the glitch overlay.
   * Falls back to `data-text`, `placeholder`, or `aria-label` when available.
   */
  glitchText?: string;
  /** Sets the Field.Root variant */
  variant?: FieldVariant;
  /** Overrides the glitch overlay intensity */
  glitchIntensity?: GlitchOverlayToken;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    inputClassName,
    id,
    name,
    "aria-label": ariaLabel,
    height = "md",
    indent = false,
    children,
    hasEndSlot = false,
    ringTone,
    glitch = false,
    glitchText,
    variant = "surface",
    glitchIntensity,
    ...props
  },
  ref,
) {
  const { id: finalId, name: finalName, isInvalid } = useFieldIds(
    ariaLabel as string | undefined,
    id,
    name,
    {
      ariaInvalid: props["aria-invalid"],
      ariaLabelStrategy: "custom-id",
    },
  );
  const { ["data-text"]: providedGlitchTextRaw, ...inputProps } = props as
    typeof props & { ["data-text"]?: unknown };
  const disabled = inputProps.disabled;
  const readOnly = inputProps.readOnly;
  const loadingAttr = inputProps["data-loading"];
  const loading =
    loadingAttr === "" ||
    loadingAttr === true ||
    loadingAttr === "true" ||
    loadingAttr === 1;

  const showEndSlot = hasEndSlot || React.Children.count(children) > 0;
  const placeholderText =
    typeof inputProps.placeholder === "string" ? inputProps.placeholder : undefined;
  const providedGlitchText =
    typeof providedGlitchTextRaw === "string" ? providedGlitchTextRaw : undefined;
  const resolvedGlitchText = glitch
    ? glitchText ?? providedGlitchText ?? placeholderText ?? (typeof ariaLabel === "string" ? ariaLabel : undefined)
    : providedGlitchText ?? glitchText;

  return (
    <Field.Root
      height={height}
      invalid={isInvalid}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
      glitch={glitch}
      glitchText={resolvedGlitchText}
      glitchIntensity={glitchIntensity}
      variant={variant}
      className={cn(ringTone ? RING_TONE_CLASS_MAP[ringTone] : undefined, className)}
    >
      <Field.Input
        ref={ref}
        id={finalId}
        name={finalName}
        className={cn(inputClassName)}
        indent={indent}
        hasEndSlot={showEndSlot || loading}
        aria-label={ariaLabel}
        {...inputProps}
      />
      {children}
    </Field.Root>
  );
});

Input.displayName = "Input";
