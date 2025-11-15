"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Card, IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { PromptWithTitle } from "./types";

export type PromptCardPrompt = PromptWithTitle & {
  createdAtDateTime: string;
  createdAtLabel: string;
};

export interface PromptCardProps {
  prompt: PromptCardPrompt;
  onSelect?: (prompt: PromptCardPrompt) => void;
  onEdit?: (prompt: PromptCardPrompt) => void;
  onDelete?: (prompt: PromptCardPrompt) => void;
  className?: string;
}

export function PromptCard({
  prompt,
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

  const handleEdit: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.stopPropagation();
    onEdit?.(prompt);
  };

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.stopPropagation();
    onDelete?.(prompt);
  };

  const isInteractive = Boolean(onSelect);

  return (
    <Card
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleSelect : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex flex-col gap-[var(--space-2)] rounded-card border border-border/70",
        "bg-card/70 p-[var(--space-3)] backdrop-blur-sm transition-colors",
        "shadow-[var(--depth-shadow-soft)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isInteractive &&
          "cursor-pointer hover:border-primary/40 hover:bg-card/90 hover:shadow-[var(--depth-glow-shadow-soft)]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="min-w-0 space-y-[var(--space-1)]">
          <h3 className="truncate font-semibold text-body text-card-foreground">
            {prompt.title}
          </h3>
          <time
            dateTime={prompt.createdAtDateTime}
            className="block text-label text-muted-foreground"
          >
            Saved {prompt.createdAtLabel}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-[var(--space-1-5)]">
          <IconButton
            aria-label={`Edit ${prompt.title}`}
            size="sm"
            variant="quiet"
            tone="primary"
            onClick={handleEdit}
          >
            <Pencil aria-hidden="true" />
          </IconButton>
          <IconButton
            aria-label={`Delete ${prompt.title}`}
            size="sm"
            variant="quiet"
            tone="danger"
            onClick={handleDelete}
          >
            <Trash2 aria-hidden="true" />
          </IconButton>
        </div>
      </header>
      {prompt.text ? (
        <p className="line-clamp-3 whitespace-pre-line text-ui text-muted-foreground">
          {prompt.text}
        </p>
      ) : null}
    </Card>
  );
}
