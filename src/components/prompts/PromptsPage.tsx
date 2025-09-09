"use client";

/**
 * PromptsPage — Title + Search in Header (hero)
 * - Sticky header holds: Title + count (left), Search + Save (right)
 * - Body: compose panel (title + text) and the list
 */

import * as React from "react";
import { SectionCard, Card } from "@/components/ui";
import { LOCALE } from "@/lib/utils";
import PromptsHeader from "./PromptsHeader";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import { usePrompts } from "./usePrompts";

export default function PromptsPage() {
  const { prompts, query, setQuery, filtered, save } = usePrompts();

  // Drafts
  const [titleDraft, setTitleDraft] = React.useState("");
  const [textDraft, setTextDraft] = React.useState("");

  const handleSave = React.useCallback(() => {
    if (save(titleDraft, textDraft)) {
      setTitleDraft("");
      setTextDraft("");
    }
  }, [save, titleDraft, textDraft]);

  return (
    <SectionCard>
      <SectionCard.Header sticky topClassName="top-8" className="gap-3">
        <PromptsHeader
          count={prompts.length}
          query={query}
          onQueryChange={setQuery}
          onSave={handleSave}
          disabled={!titleDraft.trim() && !textDraft.trim()}
        />
      </SectionCard.Header>
      <SectionCard.Body>
        <PromptsComposePanel
          title={titleDraft}
          onTitleChange={setTitleDraft}
          text={textDraft}
          onTextChange={setTextDraft}
        />

        {/* List */}
        <ul className="mt-4 space-y-3">
          {filtered.map((p) => (
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
          {filtered.length === 0 && (
            <li className="text-muted-foreground">
              Nothing matches your search. Typical.
            </li>
          )}
        </ul>

        <PromptsDemos />
      </SectionCard.Body>
    </SectionCard>
  );
}

