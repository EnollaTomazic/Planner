"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Card, IconButton } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";
import type { PromptWithTitle } from "./types";

export type PromptCardData = PromptWithTitle & {
  createdAtDateTime: string;
  createdAtLabel: string;
};

export interface PromptCardProps {
  prompt: PromptCardData;
  statusBadge?: React.ReactNode;
  onSelect?: (prompt: PromptCardData) => void;
  onEdit?: (prompt: PromptCardData) => void;
  onDelete?: (prompt: PromptCardData) => void;
  className?: string;
}

export function PromptCard({
  prompt,
  statusBadge,
  onSelect,
  onEdit,
  onDelete,
  className,
}: PromptCardProps) {
  const handleSelect = React.useCallback(() => {
    onSelect?.(prompt);
  }, [onSelect, prompt]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(prompt);
    }
  };

  const handleEditClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.stopPropagation();
    onEdit?.(prompt);
  };

  const handleDeleteClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.stopPropagation();
    onDelete?.(prompt);
  };

  return (
    <Card
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative isolate flex flex-col gap-[var(--space-3)] overflow-hidden",
        "border border-border/70 bg-card/80 p-[var(--space-4)] shadow-neo-soft transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        onSelect &&
          "cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-gradient-blob-primary opacity-0 blur-[var(--space-4)] transition-opacity duration-motion-sm ease-out motion-reduce:animate-none motion-safe:animate-blob-drift group-hover:opacity-[var(--glitch-overlay-opacity-card,0.08)] group-focus-visible:opacity-[var(--glitch-overlay-opacity-card,0.08)] group-focus-within:opacity-[var(--glitch-overlay-opacity-card,0.08)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-[var(--space-4)] top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent"
      />

      <header className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="min-w-0 space-y-[var(--space-1-5)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <h3 className="truncate font-semibold text-body">{prompt.title}</h3>
            {statusBadge}
          </div>
          {prompt.category ? (
            <Badge tone="neutral" size="sm">
              {prompt.category}
            </Badge>
          ) : null}
          <time
            dateTime={prompt.createdAtDateTime}
            className="flex items-center gap-[var(--space-1)] text-label text-muted-foreground"
          >
            <span
              aria-hidden
              className="block size-[var(--space-2)] rounded-full bg-primary/70"
            />
            Saved {prompt.createdAtLabel}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-[var(--space-1-5)]">
          <IconButton
            aria-label={`Edit ${prompt.title}`}
            size="sm"
            variant="quiet"
            tone="primary"
            onClick={handleEditClick}
          >
            <Pencil aria-hidden="true" />
          </IconButton>
          <IconButton
            aria-label={`Delete ${prompt.title}`}
            size="sm"
            variant="quiet"
            tone="danger"
            onClick={handleDeleteClick}
          >
            <Trash2 aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      {prompt.text ? (
        <p className="line-clamp-3 whitespace-pre-line rounded-[var(--radius-md)] bg-card/70 px-[var(--space-3)] py-[var(--space-2-5)] text-ui text-muted-foreground ring-1 ring-inset ring-border/40">
          {prompt.text}
        </p>
      ) : null}
    </Card>
  );
}
