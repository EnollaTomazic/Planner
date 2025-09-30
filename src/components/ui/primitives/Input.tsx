// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import Field from "./Field";
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
  /** Enables the glitch treatment for the enclosing field */
  glitch?: boolean;
  /** Optional overlay label when glitch is enabled */
  glitchText?: string;
};

/**
 * Input — Matte field with optional trailing slot.
 * - Accepts className overrides and passes all standard <input> props
 * - Auto-generates a stable `id`; if no `name` is supplied, the generated id is
 *   reused to ensure uniqueness. The `aria-label` is only slugified when a
 *   custom `id` guarantees uniqueness.
 */
export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
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
  const disabled = props.disabled;
  const readOnly = props.readOnly;
  const loadingAttr = props["data-loading"];
  const loading =
    loadingAttr === "" ||
    loadingAttr === true ||
    loadingAttr === "true" ||
    loadingAttr === 1;

  const rawDataText = (props as Record<string, unknown>)["data-text"];
  const providedGlitchText =
    typeof rawDataText === "string" ? rawDataText : undefined;
  const placeholderText =
    typeof props.placeholder === "string" ? props.placeholder : undefined;
  const resolvedGlitchText = glitch
    ? glitchText ?? providedGlitchText ?? placeholderText
    : undefined;

  const showEndSlot = hasEndSlot || React.Children.count(children) > 0;

  return (
    <Field.Root
      height={height}
      invalid={isInvalid}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
      glitch={glitch}
      glitchText={resolvedGlitchText}
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
        data-glitch={glitch ? "true" : undefined}
        {...props}
      />
      {children}
    </Field.Root>
  );
});
