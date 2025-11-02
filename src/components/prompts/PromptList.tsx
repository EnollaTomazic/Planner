"use client";

import * as React from "react";
import { GenericList } from "@/components/lists/GenericList";
import type { GenericListEmptyState } from "@/components/lists/GenericList";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { LOCALE } from "@/lib/utils";
import type { PromptWithTitle } from "./types";

export type PromptListProps = {
  prompts: PromptWithTitle[];
  query: string;
};

export function PromptList({ prompts, query }: PromptListProps) {
  const q = query.trim();
  const formattedPrompts = React.useMemo(
    () =>
      prompts.map((p) => {
        const createdAt = new Date(p.createdAt);
        return {
          ...p,
          createdAtDateTime: createdAt.toISOString(),
          createdAtLabel: createdAt.toLocaleString(LOCALE),
        };
      }),
    [prompts],
  );
  const emptyState: GenericListEmptyState | undefined = React.useMemo(() => {
    if (prompts.length === 0) {
      if (q) {
        return {
          title: "No prompts found",
          description: (
            <span className="inline-flex items-center gap-[var(--space-1)]">
              No prompts match <Badge size="sm" tone="neutral">{q}</Badge>
            </span>
          ),
        };
      }
      return {
        title: "No prompts saved yet",
        description: "Create a prompt to build your library.",
      };
    }
    return undefined;
  }, [prompts.length, q]);

  return (
    <GenericList
      items={formattedPrompts}
      getKey={(prompt) => prompt.id}
      listClassName="mt-[var(--space-4)] space-y-[var(--space-3)]"
      emptyState={emptyState}
      renderItem={(prompt) => (
        <Card className="p-[var(--space-3)]">
          <header className="flex items-center justify-between">
            <h3 className="font-semibold">{prompt.title}</h3>
            <time
              dateTime={prompt.createdAtDateTime}
              className="text-label text-muted-foreground"
            >
              {prompt.createdAtLabel}
            </time>
          </header>
          {prompt.text ? (
            <p className="mt-[var(--space-1)] whitespace-pre-wrap text-ui">
              {prompt.text}
            </p>
          ) : null}
        </Card>
      )}
    />
  );
}

