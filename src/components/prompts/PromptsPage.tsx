"use client";

/**
 * PromptsPage — Title + Search in Header (hero)
 * - Sticky header holds: Title + count (left), Search + Save (right)
 * - Body: compose panel (title + text) and the list
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Textarea from "@/components/ui/primitives/textarea";
import Button from "@/components/ui/primitives/button";
import Input from "@/components/ui/primitives/input";
import OutlineGlowDemo from "@/components/prompts/OutlineGlowDemo";
import { useLocalDB, uid } from "@/lib/db";
import { LOCALE } from "@/lib/utils";
import { Check as CheckIcon } from "lucide-react";

type Prompt = {
  id: string;
  title?: string;             // optional for back-compat
  text: string;
  createdAt: number;
};

export default function PromptsPage() {
  // Storage
  const [prompts, setPrompts] = useLocalDB<Prompt[]>("prompts.v1", []);

  // Drafts
  const [titleDraft, setTitleDraft] = React.useState("");
  const [textDraft, setTextDraft] = React.useState("");

  // Search (now lives in the header)
  const [query, setQuery] = React.useState("");

  const titleId = React.useId();

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
  }, [prompts, query]);

  function deriveTitle(p: Prompt) {
    if (p.title && p.title.trim()) return p.title.trim();
    const firstLine = (p.text || "").split(/\r?\n/)[0]?.trim() || "";
    return firstLine || "Untitled";
  }

  function save() {
    const text = textDraft.trim();
    const title = (titleDraft.trim() || text.split(/\r?\n/)[0]?.trim() || "Untitled");
    if (!text && !titleDraft.trim()) return; // nothing to save

    const next: Prompt = {
      id: uid("p"),
      title,
      text,
      createdAt: Date.now()
    };
    setPrompts((prev) => [next, ...prev]);
    setTitleDraft("");
    setTextDraft("");
  }

  return (
    <SectionCard>
      {/* Sticky hero header with search on the right */}
      <SectionCard.Header sticky className="gap-3">
        <div className="flex items-center justify-between w-full">
          {/* Left: title + count */}
          <div className="flex items-center gap-3">
            <h2 className="card-title">Prompts</h2>
            <span className="pill">{prompts.length} saved</span>
          </div>

          {/* Right: search + save */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-48 sm:w-64 md:w-80">
              <Input
                placeholder="Search prompts…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              onClick={save}
              disabled={!titleDraft.trim() && !textDraft.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </SectionCard.Header>

      <SectionCard.Body>
        <OutlineGlowDemo />
        {/* Compose panel */}
        <div className="space-y-2.5">
          <Input
            id={titleId}
            placeholder="Title"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            aria-describedby={`${titleId}-help`}
          >
            <button
              type="button"
              aria-label="Confirm"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center border border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/0.25)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.22)]"
            >
              <CheckIcon className="size-4" />
            </button>
          </Input>
          <p id={`${titleId}-help`} className="mt-1 text-xs text-muted-foreground">
            Add a short title
          </p>
          <Textarea
            placeholder="Write your prompt or snippet…"
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {filtered.map((p) => (
            <article key={p.id} className="card-neo p-3">
              <header className="flex items-center justify-between">
                <h3 className="font-semibold">{p.title}</h3>
                <time className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString(LOCALE)}
                </time>
              </header>
              {p.text ? (
                <p className="mt-1 whitespace-pre-wrap text-sm">{p.text}</p>
              ) : null}
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="text-muted-foreground">Nothing matches your search. Typical.</div>
          )}
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}
