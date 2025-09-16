// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import FieldShell from "./FieldShell";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "height"
> & {
  /** Visual height of the control (defaults to medium) */
  height?: InputSize | number;
  /** When true, increases left padding for icons */
  indent?: boolean;
  /** Optional className for the inner <input> element */
  inputClassName?: string;
  /** Reserve space for a trailing slot even if no children are provided */
  hasEndSlot?: boolean;
};

const HEIGHT: Record<InputSize, string> = {
  sm: "var(--control-h-sm)",
  md: "var(--control-h-md)",
  lg: "var(--control-h-lg)",
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
    style,
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

  const showEndSlot = hasEndSlot || React.Children.count(children) > 0;

  const controlHeight =
    typeof height === "string"
      ? HEIGHT[height]
      : typeof height === "number"
        ? `${height / 4}rem`
        : HEIGHT.md;

  return (
    <FieldShell
      error={isInvalid}
      disabled={disabled}
      readOnly={readOnly}
      className={className}
      style={{ "--control-h": controlHeight, ...style } as React.CSSProperties}
    >
      <input
        ref={ref}
        id={finalId}
        name={finalName}
        className={cn(
          "w-full rounded-[inherit] bg-transparent px-3 text-ui text-foreground placeholder:text-muted-foreground/70 caret-accent border-none focus:outline-none focus-visible:outline-none h-[var(--control-h)] hover:bg-[--hover] active:bg-[--active] disabled:opacity-[var(--disabled)] disabled:cursor-not-allowed read-only:cursor-default data-[loading=true]:opacity-[var(--loading)]",
          indent && "pl-7",
          showEndSlot && "pr-7",
          inputClassName,
        )}
        {...props}
      />
      {children}
    </FieldShell>
  );
});
