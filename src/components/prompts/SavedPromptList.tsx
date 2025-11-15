"use client";

import * as React from "react";
import { GenericList } from "@/components/lists/GenericList";
import type { GenericListEmptyState } from "@/components/lists/GenericList";
import { Badge } from "@/components/ui/primitives/Badge";
import { LOCALE } from "@/lib/utils";
import { PromptCard } from "./PromptCard";
import type { PromptCardPrompt } from "./PromptCard";
import type { PromptWithTitle } from "./types";

export interface SavedPromptListProps {
  prompts: PromptWithTitle[];
  query: string;
  onSelectPrompt?: (prompt: PromptWithTitle) => void;
  onEditPrompt?: (prompt: PromptWithTitle) => void;
  onDeletePrompt?: (prompt: PromptWithTitle) => void;
}

export function SavedPromptList({
  prompts,
  query,
  onSelectPrompt,
  onEditPrompt,
  onDeletePrompt,
}: SavedPromptListProps) {
  const trimmedQuery = query.trim();

  const formattedPrompts = React.useMemo<PromptCardPrompt[]>(
    () =>
      prompts.map((prompt) => {
        const createdAt = new Date(prompt.createdAt);
        return {
          ...prompt,
          createdAtDateTime: createdAt.toISOString(),
          createdAtLabel: createdAt.toLocaleString(LOCALE),
        } satisfies PromptCardPrompt;
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
        title: (
          <span className="flex flex-col gap-[var(--space-1)] text-card-foreground">
            <span className="text-body font-semibold">Your prompt library is empty</span>
            <span className="text-ui text-muted-foreground">
              Save prompts you love and they&apos;ll show up here for quick reuse.
            </span>
          </span>
        ),
        description: (
          <span className="text-sm text-muted-foreground">
            Start by giving your prompt a title and tapping <strong>Save</strong>.
          </span>
        ),
      } satisfies GenericListEmptyState;
    }
    return undefined;
  }, [prompts.length, trimmedQuery]);

  const handleSelectPrompt = React.useCallback(
    (prompt: PromptCardPrompt) => {
      onSelectPrompt?.(prompt);
    },
    [onSelectPrompt],
  );

  const handleEditPrompt = React.useCallback(
    (prompt: PromptCardPrompt) => {
      onEditPrompt?.(prompt);
    },
    [onEditPrompt],
  );

  const handleDeletePrompt = React.useCallback(
    (prompt: PromptCardPrompt) => {
      onDeletePrompt?.(prompt);
    },
    [onDeletePrompt],
  );

  return (
    <GenericList
      items={formattedPrompts}
      getKey={(prompt) => prompt.id}
      listClassName="mt-[var(--space-4)] space-y-[var(--space-3)]"
      emptyState={emptyState}
      renderItem={(prompt) => (
        <PromptCard
          prompt={prompt}
          onSelect={onSelectPrompt ? handleSelectPrompt : undefined}
          onEdit={onEditPrompt ? handleEditPrompt : undefined}
          onDelete={onDeletePrompt ? handleDeletePrompt : undefined}
        />
      )}
    />
  );
}
