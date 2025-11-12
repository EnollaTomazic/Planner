"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { GenericList } from "@/components/lists/GenericList";
import type { GenericListEmptyState } from "@/components/lists/GenericList";
import { Card, IconButton } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn, LOCALE } from "@/lib/utils";
import type { PromptWithTitle } from "./types";

export interface SavedPromptListProps {
  prompts: PromptWithTitle[];
  query: string;
  onSelectPrompt?: (prompt: PromptWithTitle) => void;
  onEditPrompt?: (prompt: PromptWithTitle) => void;
  onDeletePrompt?: (prompt: PromptWithTitle) => void;
}

type FormattedPrompt = PromptWithTitle & {
  createdAtDateTime: string;
  createdAtLabel: string;
};

export function SavedPromptList({
  prompts,
  query,
  onSelectPrompt,
  onEditPrompt,
  onDeletePrompt,
}: SavedPromptListProps) {
  const trimmedQuery = query.trim();

  const formattedPrompts = React.useMemo<FormattedPrompt[]>(
    () =>
      prompts.map((prompt) => {
        const createdAt = new Date(prompt.createdAt);
        return {
          ...prompt,
          createdAtDateTime: createdAt.toISOString(),
          createdAtLabel: createdAt.toLocaleString(LOCALE),
        } satisfies FormattedPrompt;
      }),
    [prompts],
  );

  const emptyState: GenericListEmptyState | undefined = React.useMemo(() => {
    if (prompts.length === 0) {
      if (trimmedQuery) {
        return {
          title: "No prompts found",
          description: (
            <span className="inline-flex items-center gap-[var(--space-1)]">
              No prompts match <Badge size="sm" tone="neutral">{trimmedQuery}</Badge>
            </span>
          ),
        } satisfies GenericListEmptyState;
      }
      return {
        title: "No prompts saved yet",
        description: "Create a prompt to build your library.",
      } satisfies GenericListEmptyState;
    }
    return undefined;
  }, [prompts.length, trimmedQuery]);

  return (
    <GenericList
      items={formattedPrompts}
      getKey={(prompt) => prompt.id}
      listClassName="mt-[var(--space-4)] space-y-[var(--space-3)]"
      emptyState={emptyState}
      renderItem={(prompt) => {
        const handleSelect = () => {
          onSelectPrompt?.(prompt);
        };

        const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
          event,
        ) => {
          if (!onSelectPrompt) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectPrompt(prompt);
          }
        };

        const handleEditClick: React.MouseEventHandler<HTMLButtonElement> = (
          event,
        ) => {
          event.stopPropagation();
          onEditPrompt?.(prompt);
        };

        const handleDeleteClick: React.MouseEventHandler<HTMLButtonElement> = (
          event,
        ) => {
          event.stopPropagation();
          onDeletePrompt?.(prompt);
        };

        return (
          <Card
            role={onSelectPrompt ? "button" : undefined}
            tabIndex={onSelectPrompt ? 0 : undefined}
            onClick={onSelectPrompt ? handleSelect : undefined}
            onKeyDown={handleKeyDown}
            className={cn(
              "group flex flex-col gap-[var(--space-2)] rounded-card border border-border bg-card/80 p-[var(--space-3)] shadow-neo transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              onSelectPrompt &&
                "cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
            )}
          >
            <header className="flex items-start justify-between gap-[var(--space-3)]">
              <div className="min-w-0 space-y-[var(--space-1)]">
                <h3 className="truncate font-semibold text-body">{prompt.title}</h3>
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
              <p className="line-clamp-3 whitespace-pre-line text-ui text-muted-foreground">
                {prompt.text}
              </p>
            ) : null}
          </Card>
        );
      }}
    />
  );
}
