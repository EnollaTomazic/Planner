"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "./Input";

export type SearchBarProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  value: string;
  onValueChange?: (next: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit?: (value: string) => void;
  right?: React.ReactNode;
  clearable?: boolean;
  debounceMs?: number;
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
  debounceMs = 0,
  autoComplete = "off",
  autoCorrect = "off",
  spellCheck = false,
  autoCapitalize = "none",
  ...rest
}: SearchBarProps) {
  // Hydration-safe: initial render = prop value
  const [query, setQuery] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Mirror external value into local state whenever it changes.
  // No need to read `query` here; linter calms down.
  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced emit of local changes
  React.useEffect(() => {
    if (!onValueChange) return;
    if (debounceMs <= 0) {
      onValueChange(query);
      return;
    }
    const t = setTimeout(() => onValueChange(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, onValueChange, debounceMs]);

  const showClear = clearable && query.length > 0;

  return (
    <form
      role="search"
      className={cn(
        // Two-column grid: search input + optional right slot
        // Tailwind's arbitrary value syntax uses an underscore instead of a comma.
        // `minmax(0,1fr)` prevents input overflow when space is constrained.
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 w-full",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onValueChange?.(query);
        onSubmit?.(query);
      }}
    >
      {/* Input column */}
      <div className="relative min-w-0">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />

        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e);
          }}
          placeholder={placeholder}
          indent
          className={cn(
            "w-full",
              showClear && "pr-40",
            "border-[hsl(var(--border))] bg-[hsl(var(--input))]"
          )}
          aria-label={rest["aria-label"] ?? "Search"}
          type="search"
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          autoCapitalize={autoCapitalize}
          {...rest}
        />

        {showClear && (
            <button
              type="button"
              aria-label="Clear"
              title="Clear"
              className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
              setQuery("");
              onValueChange?.("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* Right slot (filters, etc.) */}
      {right ? <div className="shrink-0">{right}</div> : null}
    </form>
  );
}
