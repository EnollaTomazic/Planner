import * as React from "react";
import { Card } from "@/components/ui";
import { LOCALE } from "@/lib/utils";
import type { PromptWithTitle } from "./usePrompts";

export type PromptListProps = {
  prompts: PromptWithTitle[];
};

export default function PromptList({ prompts }: PromptListProps) {
  return (
    <ul className="mt-4 space-y-3">
      {prompts.map((p) => (
        <li key={p.id}>
          <Card className="p-3">
            <header className="flex items-center justify-between">
              <h3 className="font-semibold">{p.title}</h3>
              <time
                dateTime={new Date(p.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {new Date(p.createdAt).toLocaleString(LOCALE)}
              </time>
            </header>
            {p.text ? (
              <p className="mt-1 whitespace-pre-wrap text-sm">{p.text}</p>
            ) : null}
          </Card>
        </li>
      ))}
      {prompts.length === 0 ? (
        <li className="text-muted-foreground">
          Nothing matches your search. Typical.
        </li>
      ) : null}
    </ul>
  );
}

