"use client";

import * as React from "react";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";
import { HeroSearchBar } from "@/components/ui/layout/hero/HeroSearchBar";
import { Badge } from "@/components/ui/primitives/Badge";

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
  const navItems = React.useMemo<HeaderNavItem[]>(
    () =>
      PRIMARY_PAGE_NAV.map((item) => ({
        ...item,
        active: item.key === "prompts",
      })),
    [],
  );
  const handleChip = React.useCallback(
    (chip: string) => {
      const nextQuery = query === chip ? "" : chip;
      onQueryChange(nextQuery);
    },
    [onQueryChange, query],
  );

  const searchId = `${id}-search`;

  return (
    <Header
      id={id}
      heading="Prompts"
      subtitle="Capture, remix, and reuse saved prompts."
      navItems={navItems}
      variant="neo"
      underlineTone="brand"
      showThemeToggle
      sticky={false}
      className="relative isolate"
      search={
        <HeroSearchBar
          id={searchId}
          value={query}
          onValueChange={onQueryChange}
          debounceMs={300}
          placeholder="Search prompts…"
          aria-label="Search prompts"
          variant="neo"
          round
        />
      }
      actions={
        <span className="pill" aria-live="polite">
          {count} saved
        </span>
      }
    >
      <div className="hidden flex-wrap items-center gap-[var(--space-2)] sm:flex">
        {chips.map((chip) => {
          const isSelected = query === chip;

          return (
            <Badge
              key={chip}
              interactive
              selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => handleChip(chip)}
            >
              {chip}
            </Badge>
          );
        })}
      </div>
    </Header>
  );
}

