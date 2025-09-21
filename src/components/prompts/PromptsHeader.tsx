"use client";

import * as React from "react";
import { Button, PageHeader } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";

const chips = ["hover", "focus", "active", "disabled", "loading"];

interface PromptsHeaderProps {
  id?: string;
  count: number;
  query: string;
  onQueryChange: (value: string) => void;
  onSave: () => void;
  disabled: boolean;
}

export default function PromptsHeader({
  id = "prompts-header",
  count,
  query,
  onQueryChange,
  onSave,
  disabled,
}: PromptsHeaderProps) {
  const handleChip = React.useCallback(
    (chip: string) => {
      const nextQuery = query === chip ? "" : chip;
      onQueryChange(nextQuery);
    },
    [onQueryChange, query],
  );

  const searchId = `${id}-search`;

  return (
    <PageHeader
      containerClassName="relative isolate"
      header={{
        id,
        heading: "Prompts",
        sticky: false,
        right: (
          <span className="pill" aria-live="polite">
            {count} saved
          </span>
        ),
      }}
      hero={{
        frame: false,
        sticky: false,
        tone: "supportive",
        topClassName: "top-[var(--header-stack)]",
        heading: (
          <span className="sr-only" id={`${id}-hero`}>
            Prompt workspace controls
          </span>
        ),
        children: (
          <div className="hidden sm:flex flex-wrap items-center gap-[var(--space-2)]">
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
        ),
        search: {
          id: searchId,
          value: query,
          onValueChange: onQueryChange,
          debounceMs: 300,
          placeholder: "Search prompts…",
          "aria-label": "Search prompts",
          variant: "default",
          round: false,
        },
        actions: (
          <Button type="button" variant="primary" onClick={onSave} disabled={disabled}>
            Save
          </Button>
        ),
      }}
    />
  );
}

