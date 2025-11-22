"use client";

import * as React from "react";

import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";

type StateTesterProps = {
  chips: ReadonlyArray<string>;
  selectedChip?: string;
  onSelect: (chip: string) => void;
  groupLabel?: string;
  className?: string;
};

export function StateTester({
  chips,
  selectedChip,
  onSelect,
  groupLabel = "Prompt chip filters",
  className,
}: StateTesterProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const toggleRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const shouldRestoreFocus = React.useRef(false);

  const handleToggle = React.useCallback(() => {
    if (open) {
      shouldRestoreFocus.current = true;
    }

    setOpen((previous) => !previous);
  }, [open]);

  const handleClose = React.useCallback(() => {
    shouldRestoreFocus.current = true;
    setOpen(false);
  }, []);

  const focusFirstChip = React.useCallback(() => {
    const firstChip = panelRef.current?.querySelector<HTMLElement>(
      "[data-state-tester-chip=true]",
    );

    if (firstChip) {
      firstChip.focus({ preventScroll: true });
      return;
    }

    panelRef.current?.focus({ preventScroll: true });
  }, []);

  React.useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(focusFirstChip);

      return () => cancelAnimationFrame(frame);
    }

    if (shouldRestoreFocus.current) {
      toggleRef.current?.focus({ preventScroll: true });
      shouldRestoreFocus.current = false;
    }
  }, [focusFirstChip, open]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    },
    [handleClose],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--space-2)]",
        "px-[var(--space-2)] sm:px-[var(--space-1)] md:px-0",
        className,
      )}
    >
      <Button
        ref={toggleRef}
        variant="quiet"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        className="h-auto self-start p-0 text-muted-foreground underline-offset-4 hover:text-foreground"
      >
        {open ? "Hide badge states" : "Show badge states"}
      </Button>

      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          role="group"
          tabIndex={-1}
          aria-label={groupLabel}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex flex-col gap-[var(--space-2)]",
            "rounded-[var(--radius-lg)]",
            "border border-[color-mix(in_oklab,theme('colors.border')_80%,transparent)]",
            "bg-[color-mix(in_oklab,theme('colors.panel')_85%,transparent)]",
            "p-[var(--space-2)] shadow-[var(--shadow-border-md)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[theme('colors.focus.visible')] focus-visible:ring-offset-2",
          )}
        >
          <p className="text-sm text-muted-foreground">
            Try out the badge interaction states without cluttering the hero layout.
          </p>

          <div
            className={cn(
              "flex items-center gap-[var(--space-2)]",
              "overflow-x-auto",
              "pb-[var(--space-1)]",
              "[-webkit-overflow-scrolling:touch]",
            )}
          >
            {chips.map((chip, index) => {
              const isSelected = selectedChip === chip;

              return (
                <Badge
                  key={chip}
                  interactive
                  selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(chip)}
                  data-state-tester-chip={index === 0 ? "true" : undefined}
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
        </div>
      ) : null}
    </div>
  );
}
