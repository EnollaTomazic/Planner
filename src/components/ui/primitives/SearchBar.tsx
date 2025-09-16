"use client";

import * as React from "react";
import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebouncedCallback from "@/lib/useDebouncedCallback";
import Label from "../Label";
import Input, { type InputSize } from "./Input";
import IconButton from "./IconButton";

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
  /** Additional classes for the outer FieldShell */
  fieldClassName?: string;
  /** When `true`, the search bar is disabled and `data-loading` is set */
  loading?: boolean;
  /** Optional accessible label rendered above the input */
  label?: React.ReactNode;
  /** Visual treatment of the field shell. */
  variant?: "default" | "neo";
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

  const showClear = clearable && query.length > 0;
  const ariaLabelledby = restProps["aria-labelledby"];
  const hasCustomAriaLabel = restProps["aria-label"] !== undefined;
  const labelFor = resolvedId;
  const variantFieldClasses =
    variant === "neo"
      ? "hero2-neomorph !border border-[hsl(var(--border)/0.4)] !shadow-neo-inset hover:!shadow-neo-soft active:!shadow-neo-inset focus-within:!shadow-neo-soft [--hover:transparent] [--active:transparent]"
      : undefined;

  const inputField = (
    <>
      <Search
        className="pointer-events-none absolute left-[var(--space-4)] top-1/2 -translate-y-1/2 size-[var(--space-4)] text-muted-foreground"
        aria-hidden
      />

      <Input
        id={resolvedId}
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange?.(e);
        }}
        placeholder={placeholder}
        indent
        height={height}
        className={cn(
          "w-full",
          showClear && "pr-[var(--space-7)]",
          variantFieldClasses,
          fieldClassName,
        )}
        aria-label={
          !label && !ariaLabelledby && !hasCustomAriaLabel ? "Search" : undefined
        }
        type="search"
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        {...restProps}
        data-loading={loading}
        disabled={disabled || loading}
      />

      {showClear && (
        <IconButton
          size="sm"
          variant="ring"
          tone="primary"
          aria-label="Clear"
          title="Clear"
          className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2"
          disabled={disabled || loading}
          loading={loading}
          iconSize="sm"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <X />
        </IconButton>
      )}
    </>
  );

  return (
    <form
      role="search"
      className={cn(
        // Two-column grid: search input + optional right slot
        // Tailwind's arbitrary value syntax uses an underscore instead of a comma.
        // `minmax(0,1fr)` prevents input overflow when space is constrained.
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--space-2)] w-full data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
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
          <div className="relative min-w-0">{inputField}</div>
        </div>
      ) : (
        <div className="relative min-w-0">{inputField}</div>
      )}

      {/* Right slot (filters, etc.) */}
      {right ? <div className="shrink-0">{right}</div> : null}
    </form>
  );
}
