"use client";

/**
 * PromptsPage — Title + Search in Header (hero)
 * - Sticky header holds: Title + count (left), Search + Save (right)
 * - Body: compose panel (title + text) and the list
 */

import * as React from "react";
import { SectionCard, Card } from "@/components/ui";
import { usePersistentState, uid } from "@/lib/db";
import { LOCALE } from "@/lib/utils";
import PromptsHeader from "./PromptsHeader";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";

type Prompt = {
  id: string;
  title?: string; // optional for back-compat
  text: string;
  createdAt: number;
};

export default function PromptsPage() {
  // Storage
  const [prompts, setPrompts] = usePersistentState<Prompt[]>("prompts.v1", []);

  // Drafts
  const [titleDraft, setTitleDraft] = React.useState("");
  const [textDraft, setTextDraft] = React.useState("");

  // Search (now lives in the header)
  const [query, setQuery] = React.useState("");

  const deriveTitle = React.useCallback((p: Prompt) => {
    if (p.title && p.title.trim()) return p.title.trim();
    const firstLine = (p.text || "").split(/\r?\n/)[0]?.trim() || "";
    return firstLine || "Untitled";
  }, []);

  // Derived: filtered list (compute titles once per prompt)
  type PromptWithTitle = Prompt & { title: string };
  const filtered: PromptWithTitle[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.reduce<PromptWithTitle[]>((acc, p) => {
      const title = deriveTitle(p);
      const text = p.text || "";
      if (!q || title.toLowerCase().includes(q) || text.toLowerCase().includes(q)) {
        acc.push({ ...p, title });
      }
      return acc;
    }, []);
  }, [prompts, query, deriveTitle]);

  function save() {
    const text = textDraft.trim();
    const title = titleDraft.trim() || text.split(/\r?\n/)[0]?.trim() || "Untitled";
    if (!text && !titleDraft.trim()) return; // nothing to save

    const next: Prompt = {
      id: uid("p"),
      title,
      text,
      createdAt: Date.now(),
    };
    setPrompts((prev) => [next, ...prev]);
    setTitleDraft("");
    setTextDraft("");
  }

  return (
    <SectionCard>
      <SectionCard.Header sticky topClassName="top-8" className="gap-3">
        <PromptsHeader
          count={prompts.length}
          query={query}
          onQueryChange={setQuery}
          onSave={save}
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

