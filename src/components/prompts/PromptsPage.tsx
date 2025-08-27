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
import { useLocalDB, uid } from "@/lib/db";

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

  // Derived: filtered list
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prompts.slice();
    return prompts.filter((p) => {
      const title = deriveTitle(p).toLowerCase();
      const text = (p.text || "").toLowerCase();
      return title.includes(q) || text.includes(q);
    });
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
              variant="ghost"
              onClick={save}
              disabled={!titleDraft.trim() && !textDraft.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </SectionCard.Header>

      <SectionCard.Body>
        {/* Compose panel */}
        <div className="space-y-2">
          <Input
            placeholder="Title"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
          />
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
                <h3 className="font-semibold">{deriveTitle(p)}</h3>
                <time className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
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
