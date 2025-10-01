"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import useDebouncedCallback from "@/lib/useDebouncedCallback";
import Label from "../Label";
import Field from "./Field";
import type { InputSize } from "./Input";
import { resolveControlVariant, type ControlVariant } from "@/components/ui/variants";

const SEARCH_BAR_VARIANTS = ["default", "neo"] as const satisfies readonly ControlVariant[];
type SearchBarVariant = (typeof SEARCH_BAR_VARIANTS)[number];

export type SearchBarProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "height"
> & {
  value: string;
  onValueChange?: (next: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit?: (value: string) => void;
  right?: React.ReactNode;
  clearable?: boolean;
  debounceMs?: number;
  /** Visual height of the control */
  height?: InputSize | number;
  /** Additional classes for the outer Field.Root */
  fieldClassName?: string;
  /** When `true`, the search bar is disabled and `data-loading` is set */
  loading?: boolean;
  /** Optional accessible label rendered above the input */
  label?: React.ReactNode;
  /** Visual treatment of the field shell. */
  variant?: SearchBarVariant;
};

export default function SearchBar({
  value,
  onValueChange,
  onChange,
  onSubmit,
  right,
  placeholder = "Search…",
  className,
  clearable = true,
  debounceMs = 200,
  autoComplete = "off",
  autoCorrect = "off",
  spellCheck = false,
  autoCapitalize = "none",
  height,
  fieldClassName,
  loading,
  disabled,
  label,
  variant = "default",
  ...rest
}: SearchBarProps) {
  // Hydration-safe: initial render = prop value
  const [query, setQuery] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { id, ...restProps } = rest;
  const generatedId = useId();
  const resolvedId = id ?? (label ? generatedId : undefined);
  const [emitValueChange, cancelValueChange] = useDebouncedCallback(
    (next: string) => {
      onValueChange?.(next);
    },
    debounceMs,
  );

  // Mirror external value into local state whenever it changes.
  // No need to read `query` here; linter calms down.
  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced emit of local changes
  React.useEffect(() => {
    if (!onValueChange) {
      cancelValueChange();
      return;
    }

    emitValueChange(query);
    return cancelValueChange;
  }, [query, onValueChange, emitValueChange, cancelValueChange]);

  const ariaLabelledby = restProps["aria-labelledby"];
  const hasCustomAriaLabel = restProps["aria-label"] !== undefined;
  const labelFor = resolvedId;
  const resolvedVariant = resolveControlVariant<SearchBarVariant>(variant, {
    allowed: SEARCH_BAR_VARIANTS,
    fallback: "default",
  });

  const variantFieldClasses =
    resolvedVariant === "neo"
      ? "hero2-neomorph z-0 !border border-border/40 !shadow-depth-soft hover:!shadow-depth-soft active:!shadow-depth-soft focus-within:!shadow-depth-soft [--hover:transparent] [--active:transparent]"
      : undefined;

  const inputField = (
    <Field.Root
      height={height}
      wrapperClassName="min-w-0"
      className={cn("w-full", variantFieldClasses, fieldClassName)}
      disabled={disabled}
      loading={loading}
    >
      <Field.Search
        id={resolvedId}
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange?.(event);
        }}
        placeholder={placeholder}
        clearable={clearable}
        onClear={() => {
          setQuery("");
          onValueChange?.("");
        }}
        aria-label={
          !label && !ariaLabelledby && !hasCustomAriaLabel ? "Search" : undefined
        }
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        loading={loading}
        {...restProps}
      />
    </Field.Root>
  );

  return (
    <form
      role="search"
      className={cn(
        // Two-column grid: search input + optional right slot
        // Tailwind's arbitrary value syntax uses an underscore instead of a comma.
        // `minmax(0,1fr)` prevents input overflow when space is constrained.
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--space-2)] w-full data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onValueChange?.(query);
        onSubmit?.(query);
      }}
      data-loading={loading}
    >
      {/* Input column */}
      {label ? (
        <div className="min-w-0">
          <Label htmlFor={labelFor}>{label}</Label>
          {inputField}
        </div>
      ) : (
        <div className="min-w-0">{inputField}</div>
      )}

      {/* Right slot (filters, etc.) */}
      {right ? <div className="shrink-0">{right}</div> : null}
    </form>
  );
}
