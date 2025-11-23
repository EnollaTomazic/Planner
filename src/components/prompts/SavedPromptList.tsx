"use client";

import * as React from "react";
import { SearchX, Sparkles } from "lucide-react";

import { GenericList } from "@/components/lists/GenericList";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn, LOCALE } from "@/lib/utils";
import type { PromptWithTitle } from "./types";
import { PromptCard, type PromptCardData } from "./PromptCard";

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

  const formattedPrompts = React.useMemo<PromptCardData[]>(
    () =>
      prompts.map((prompt) => {
        const createdAt = new Date(prompt.createdAt);
        return {
          ...prompt,
          createdAtDateTime: createdAt.toISOString(),
          createdAtLabel: createdAt.toLocaleString(LOCALE),
        } satisfies PromptCardData;
      }),
    [prompts],
  );

  return (
    <GenericList
      items={formattedPrompts}
      className="mt-[var(--space-4)] [&>ul]:space-y-[var(--space-3)] [&>ul>li]:list-none"
      emptyState={<SavedPromptEmptyState query={trimmedQuery} />}
      renderItem={(prompt) => (
        <PromptCard
          prompt={prompt}
          onSelect={onSelectPrompt ? () => onSelectPrompt(prompt) : undefined}
          onEdit={onEditPrompt ? () => onEditPrompt(prompt) : undefined}
          onDelete={onDeletePrompt ? () => onDeletePrompt(prompt) : undefined}
        />
      )}
    />
  );
}

function SavedPromptEmptyState({ query }: { query: string }) {
  const trimmed = query.trim();
  const isFiltered = trimmed.length > 0;

  return (
    <Card
      className={cn(
        "relative isolate flex items-start gap-[var(--space-3)] overflow-hidden border border-dashed border-border/70 bg-card/70 p-[var(--space-4)] shadow-neo-soft",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-accent/5",
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-center rounded-full bg-card/80 p-[var(--space-3)] ring-1 ring-inset ring-border/50">
        {isFiltered ? (
          <SearchX aria-hidden className="size-[var(--space-6)] text-muted-foreground" />
        ) : (
          <Sparkles aria-hidden className="size-[var(--space-6)] text-primary" />
        )}
      </div>
      <div className="space-y-[var(--space-2)]">
        <div className="space-y-[var(--space-1)]">
          <p className="text-body font-semibold text-card-foreground">
            {isFiltered ? "No prompts match" : "Save your first prompt"}
          </p>
          <p className="text-ui text-muted-foreground">
            {isFiltered
              ? "Try different keywords or clear the search filter."
              : "Keep favorite instructions ready to reuse whenever inspiration hits."}
          </p>
        </div>
        {isFiltered ? (
          <div className="flex flex-wrap items-center gap-[var(--space-1)]">
            <span className="text-label text-muted-foreground">Searching for</span>
            <Badge size="sm" tone="neutral">
              {trimmed}
            </Badge>
          </div>
        ) : (
          <ul className="list-inside list-disc space-y-[var(--space-1)] text-ui text-muted-foreground">
            <li>Give your prompt a clear title so it is easy to scan.</li>
            <li>Include the full text you want to reuse, then hit Save.</li>
          </ul>
        )}
      </div>
    </Card>
  );
}
