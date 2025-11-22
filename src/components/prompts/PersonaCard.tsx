"use client";

import * as React from "react";

import { Card } from "@/components/ui";
import { cn, LOCALE } from "@/lib/utils";
import type { Persona } from "./types";

export interface PersonaCardProps {
  persona: Persona;
  onSelect?: (persona: Persona) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function PersonaCard({
  persona,
  onSelect,
  actions,
  className,
}: PersonaCardProps) {
  const handleSelect = React.useCallback(() => {
    onSelect?.(persona);
  }, [onSelect, persona]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(persona);
    }
  };

  const createdAt = React.useMemo(
    () => new Date(persona.createdAt),
    [persona.createdAt],
  );

  return (
    <Card
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative isolate flex h-full flex-col gap-[var(--space-3)] overflow-hidden",
        "border border-border/70 bg-card/80 p-[var(--space-4)] shadow-neo-soft transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        onSelect &&
          "cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-gradient-blob-accent opacity-0 blur-[var(--space-4)] transition-opacity duration-motion-sm ease-out motion-reduce:animate-none motion-safe:animate-blob-drift group-hover:opacity-[var(--glitch-overlay-opacity-card,0.08)] group-focus-visible:opacity-[var(--glitch-overlay-opacity-card,0.08)] group-focus-within:opacity-[var(--glitch-overlay-opacity-card,0.08)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-[var(--space-4)] top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent"
      />

      <header className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="min-w-0 space-y-[var(--space-1-5)]">
          <h4 className="truncate font-semibold text-body">{persona.name}</h4>
          {persona.description ? (
            <p className="line-clamp-2 text-ui text-muted-foreground">
              {persona.description}
            </p>
          ) : null}
          <time
            dateTime={createdAt.toISOString()}
            className="flex items-center gap-[var(--space-1)] text-label text-muted-foreground"
          >
            <span
              aria-hidden
              className="block size-[var(--space-2)] rounded-full bg-primary/70"
            />
            Added {createdAt.toLocaleString(LOCALE)}
          </time>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-[var(--space-1-5)]">
            {actions}
          </div>
        ) : null}
      </header>

      {persona.prompt ? (
        <p className="line-clamp-5 whitespace-pre-wrap rounded-[var(--radius-md)] bg-card/70 px-[var(--space-3)] py-[var(--space-2-5)] text-ui ring-1 ring-inset ring-border/40">
          {persona.prompt}
        </p>
      ) : null}
    </Card>
  );
}
