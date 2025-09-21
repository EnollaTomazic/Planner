// src/components/ui/layout/hero/HeroSearchBar.tsx

import * as React from "react";
import { cn } from "@/lib/utils";
import SearchBar, { type SearchBarProps } from "@/components/ui/primitives/SearchBar";

export interface HeroSearchBarProps extends SearchBarProps {
  className?: string;
  round?: boolean;
}

export function HeroSearchBar({
  className,
  round,
  variant,
  fieldClassName,
  ...props
}: HeroSearchBarProps) {
  const resolvedVariant = variant ?? (round ? "neo" : undefined);
  const isNeo = resolvedVariant === "neo";

  return (
    <SearchBar
      {...props}
      variant={resolvedVariant}
      className={cn(
        "w-full max-w-[calc(var(--space-8)*10)]",
        round && "rounded-full",
        className,
      )}
      fieldClassName={cn(
        round && "rounded-full [&>input]:rounded-full",
        isNeo && "overflow-hidden hero2-frame",
        fieldClassName,
      )}
    />
  );
}

