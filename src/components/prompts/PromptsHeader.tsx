"use client";

import * as React from "react";
import { HeroPageHeader } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";

const chips = ["hover", "focus", "active", "disabled", "loading"];

interface PromptsHeaderProps {
  id?: string;
  count: number;
  query: string;
  onQueryChange: (value: string) => void;
}

export function PromptsHeader({
  id = "prompts-header",
  count,
  query,
  onQueryChange,
}: PromptsHeaderProps) {
  const savedLabel = React.useMemo(() => {
    const formatted = new Intl.NumberFormat().format(count);
    return `${formatted} saved`;
  }, [count]);

  const handleChip = React.useCallback(
    (chip: string) => {
      const nextQuery = query === chip ? "" : chip;
      onQueryChange(nextQuery);
    },
    [onQueryChange, query],
  );

  const searchId = `${id}-search`;

  return (
    <HeroPageHeader
      header={{
        id,
        heading: "Prompts",
        sticky: false,
        underline: false,
        barClassName:
          "flex flex-col items-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between",
        actions: (
          <span className="whitespace-nowrap text-label font-medium tracking-[0.02em] text-muted-foreground">
            {savedLabel}
          </span>
        ),
      }}
      hero={{
        as: "div",
        frame: false,
        sticky: false,
        tone: "heroic",
        padding: "none",
        barClassName: "hidden",
        bodyClassName: "px-[var(--space-2)] sm:px-[var(--space-1)] md:px-0",
        children: (
          <div
            role="group"
            aria-label="Prompt chip filters"
            className={cn(
              "flex items-center gap-[var(--space-2)]",
              "overflow-x-auto",
              "pb-[var(--space-1)]",
              "[-webkit-overflow-scrolling:touch]",
              "-mx-[var(--space-2)] sm:-mx-[var(--space-1)] md:mx-0",
              "px-[var(--space-2)] sm:px-[var(--space-1)] md:px-0",
            )}
          >
            {chips.map((chip) => {
              const isSelected = query === chip;

              return (
                <Badge
                  key={chip}
                  interactive
                  selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => handleChip(chip)}
                  tone="accent"
                  className={cn(
                    "[--badge-surface:transparent]",
                    "border-[theme('colors.interaction.accent.surfaceHover')]",
                    "text-muted-foreground",
                    "hover:text-foreground",
                    "focus-visible:text-foreground",
                    "data-[selected=true]:!bg-[theme('colors.interaction.accent.tintActive')]",
                    "data-[selected=true]:!text-on-accent",
                    "data-[selected=true]:!border-[theme('colors.interaction.accent.surfaceActive')]",
                  )}
                >
                  {chip}
                </Badge>
              );
            })}
          </div>
        ),
      }}
      searchBar={{
        id: searchId,
        value: query,
        onValueChange: onQueryChange,
        debounceMs: 300,
        placeholder: "Search prompts…",
        "aria-label": "Search prompts",
        variant: "neo",
        round: true,
      }}
    />
  );
}

