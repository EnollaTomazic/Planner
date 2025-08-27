// src/components/ui/primitives/searchBar.tsx
"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "./input";
import IconButton from "./IconButton";

export type SearchBarProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> & {
  value: string;
  onValueChange?: (next: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  size?: "sm" | "md" | "lg";
  right?: React.ReactNode;
  clearable?: boolean;
  debounceMs?: number;
};

const sizeMap: Record<NonNullable<SearchBarProps["size"]>, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-sm",
  lg: "h-11 text-base",
};
const clearPadMap: Record<NonNullable<SearchBarProps["size"]>, string> = {
  sm: "pr-10",
  md: "pr-10",
  lg: "pr-11",
};
const btnCircleMap: Record<NonNullable<SearchBarProps["size"]>, "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};
const btnIconMap: Record<NonNullable<SearchBarProps["size"]>, "xs" | "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

export default function SearchBar({
  value,
  onValueChange,
  onChange,
  size = "md",
  right,
  placeholder = "Search…",
  className,
  clearable = true,
  debounceMs = 0,
  ...rest
}: SearchBarProps) {
  // Hydration-safe: initial render = prop value
  const [local, setLocal] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Mirror external value into local state whenever it changes.
  // No need to read `local` here; linter calms down.
  React.useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounced emit of local changes
  React.useEffect(() => {
    if (!onValueChange) return;
    if (debounceMs <= 0) {
      onValueChange(local);
      return;
    }
    const t = setTimeout(() => onValueChange(local), debounceMs);
    return () => clearTimeout(t);
  }, [local, onValueChange, debounceMs]);

  const showClear = clearable && local.length > 0;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr,auto] items-center gap-2 w-full",
        className
      )}
    >
      {/* Input column */}
      <div className="relative min-w-0">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />

        <Input
          ref={inputRef}
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            onChange?.(e); // immediate callback if the consumer wants it
          }}
          placeholder={placeholder}
          className={cn(
            "w-full pl-9 rounded-full", // always pill
            sizeMap[size],
            showClear && clearPadMap[size],
            "border-[hsl(var(--border))] bg-[hsl(var(--input))]"
          )}
          aria-label={rest["aria-label"] ?? "Search"}
          {...rest}
        />

        {showClear && (
          <IconButton
            aria-label="Clear"
            title="Clear"
            tone="primary"
            circleSize={btnCircleMap[size]}
            iconSize={btnIconMap[size]}
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
            onClick={() => {
              setLocal("");
              onValueChange?.("");
              inputRef.current?.focus();
            }}
          >
            <X />
          </IconButton>
        )}
      </div>

      {/* Right slot (filters, etc.) */}
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
