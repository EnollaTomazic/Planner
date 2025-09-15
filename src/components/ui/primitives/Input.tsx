// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { useFieldIds } from "@/lib/useFieldIds";
import { cn } from "@/lib/utils";
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
 * - Auto-generates a stable `id`/`name` pair via `useFieldIds`.
 */
export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    inputClassName,
    style,
    id: idProp,
    name: nameProp,
    "aria-label": ariaLabel,
    height = "md",
    indent = false,
    children,
    hasEndSlot = false,
    ...props
  },
  ref,
) {
  const { id, name: generatedName, isInvalid } = useFieldIds(
    ariaLabel,
    idProp,
    nameProp,
  );

  const name = nameProp ?? (idProp ? generatedName : id);

  const error = isInvalid(props["aria-invalid"]);
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
      error={error}
      disabled={disabled}
      readOnly={readOnly}
      className={className}
      style={{ "--control-h": controlHeight, ...style } as React.CSSProperties}
    >
      <input
        ref={ref}
        id={id}
        name={name}
        className={cn(
          "w-full rounded-[inherit] bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 caret-accent border-none focus:outline-none focus-visible:outline-none h-[var(--control-h)] hover:bg-[--hover] active:bg-[--active] disabled:opacity-[var(--disabled)] disabled:cursor-not-allowed read-only:cursor-default data-[loading=true]:opacity-[var(--loading)]",
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
