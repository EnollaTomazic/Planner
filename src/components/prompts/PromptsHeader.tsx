"use client";

import * as React from "react";
import { Button, Hero } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";
import {
  PROMPTS_TAB_ID_BASE,
  PROMPTS_TAB_ITEMS,
  type PromptsTabKey,
} from "./tabs";

const chips = ["hover", "focus", "active", "disabled", "loading"];

interface PromptsHeaderProps {
  id?: string;
  query: string;
  onQueryChange: (value: string) => void;
  activeTab: PromptsTabKey;
  onTabChange: (tab: PromptsTabKey) => void;
  onNewPrompt: () => void;
  onNewPersona: () => void;
  tabCounts?: Partial<Record<PromptsTabKey, number>>;
}

export function PromptsHeader({
  id = "prompts-header",
  query,
  onQueryChange,
  activeTab,
  onTabChange,
  onNewPrompt,
  onNewPersona,
  tabCounts,
}: PromptsHeaderProps) {
  const tabs = React.useMemo(() => {
    return PROMPTS_TAB_ITEMS.map((item) => {
      const badge = tabCounts?.[item.key];
      return {
        key: item.key,
        label: item.label,
        badge: badge && badge > 0 ? badge : undefined,
      };
    });
  }, [tabCounts]);

  const handleChip = React.useCallback(
    (chip: string) => {
      const nextQuery = query === chip ? "" : chip;
      onQueryChange(nextQuery);
    },
    [onQueryChange, query],
  );

  const searchId = `${id}-search`;

  return (
    <Hero
      id={id}
      className="col-span-full"
      title="Prompts"
      subtitle="Compose, save, and reuse AI prompts."
      sticky={false}
      frame={false}
      tone="heroic"
      padding="none"
      barClassName="flex flex-col items-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between"
      tabs={{
        items: tabs,
        value: activeTab,
        onChange: onTabChange,
        ariaLabel: "Prompt workspaces",
        idBase: PROMPTS_TAB_ID_BASE,
      }}
      actions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Button size="sm" onClick={onNewPrompt}>
            New prompt
          </Button>
          <Button size="sm" variant="quiet" onClick={onNewPersona}>
            New persona
          </Button>
        </div>
      }
      bodyClassName="px-[var(--space-2)] sm:px-[var(--space-1)] md:px-0"
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
    >
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
    </Hero>
  );
}

