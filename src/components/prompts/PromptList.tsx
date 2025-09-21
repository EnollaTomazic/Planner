import * as React from "react";
import { Card } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import { LOCALE } from "@/lib/utils";
import type { PromptWithTitle } from "./types";

export type PromptListProps = {
  prompts: PromptWithTitle[];
  query: string;
};

export default function PromptList({ prompts, query }: PromptListProps) {
  const q = query.trim();
  return (
    <ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
      {prompts.map((p) => (
        <li key={p.id}>
          <Card className="p-[var(--space-3)]">
            <header className="flex items-center justify-between">
              <h3 className="font-semibold">{p.title}</h3>
              <time
                dateTime={new Date(p.createdAt).toISOString()}
                className="text-label text-muted-foreground"
              >
                {new Date(p.createdAt).toLocaleString(LOCALE)}
              </time>
            </header>
            {p.text ? (
              <p className="mt-[var(--space-1)] whitespace-pre-wrap text-ui">{p.text}</p>
            ) : null}
          </Card>
        </li>
      ))}
      {prompts.length === 0 ? (
        <li className="text-muted-foreground flex items-center gap-[var(--space-1)]">
          {q ? (
            <>
              No prompts match
              <Badge size="sm" tone="neutral">{q}</Badge>
            </>
          ) : (
            "No prompts saved yet"
          )}
        </li>
      ) : null}
    </ul>
  );
}

