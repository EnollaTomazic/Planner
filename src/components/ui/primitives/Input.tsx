// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import Field from "./Field";

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

  const showEndSlot = hasEndSlot || React.Children.count(children) > 0;

  return (
    <Field.Root
      height={height}
      invalid={isInvalid}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
      className={className}
    >
      <Field.Input
        ref={ref}
        id={finalId}
        name={finalName}
        className={cn(inputClassName)}
        indent={indent}
        hasEndSlot={showEndSlot || loading}
        aria-label={ariaLabel}
        {...props}
      />
      {children}
    </Field.Root>
  );
});
