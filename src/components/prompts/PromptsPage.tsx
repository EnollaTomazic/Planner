"use client";

/**
 * PromptsPage — Title + Search in Header (hero)
 * - Sticky header holds: Title + count (left), Search + Save (right)
 * - Body: compose panel (title + text) and the list
 */

import * as React from "react";
import { SectionCard, Textarea, Button, Input, Card, FieldShell, SearchBar } from "@/components/ui";
import { useLocalDB, uid } from "@/lib/db";
import { LOCALE } from "@/lib/utils";
import { Check as CheckIcon } from "lucide-react";
import OutlineGlowDemo from "./OutlineGlowDemo";
import SectionLabel from "@/components/reviews/SectionLabel";

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
              <SearchBar
                value={query}
                onValueChange={setQuery}
                placeholder="Search prompts…"
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
          <SectionLabel>Section Label</SectionLabel>
          <p className="text-sm text-muted-foreground">Divider used in reviews</p>
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
            <Card key={p.id} className="p-3">
              <header className="flex items-center justify-between">
                <h3 className="font-semibold">{p.title}</h3>
                <time className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString(LOCALE)}
                </time>
              </header>
              {p.text ? (
                <p className="mt-1 whitespace-pre-wrap text-sm">{p.text}</p>
              ) : null}
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-muted-foreground">Nothing matches your search. Typical.</div>
          )}
        </div>
        <Card className="mt-8 space-y-4">
          <h3 className="type-title">Input</h3>
          <div className="space-y-3">
            <Input placeholder="Default" />
            <Input placeholder="Error" aria-invalid="true" />
            <Input placeholder="With action">
              <button
                type="button"
                aria-label="Confirm"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center border border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/0.25)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.22)]"
              >
                <CheckIcon className="size-4" />
              </button>
            </Input>
          </div>
        </Card>
        <Card className="mt-8 space-y-4">
          <h3 className="type-title">Textarea</h3>
          <div className="space-y-3">
            <Textarea placeholder="Default" />
            <Textarea placeholder="Pill" tone="pill" />
          </div>
        </Card>
        <Card className="mt-8 space-y-4">
          <h3 className="type-title">FieldShell</h3>
          <p className="type-body">
            Shared wrapper that provides consistent borders, background, and focus
            states for inputs. <code>Input</code>, <code>Select</code>, and
            <code>Textarea</code> all use this wrapper internally. Extend styles
            with the <code>className</code> prop on each component; use
            <code>inputClassName</code>, <code>selectClassName</code>, or
            <code>textareaClassName</code> to target the inner element.
          </p>
          <FieldShell>
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Custom content
            </div>
          </FieldShell>
        </Card>
        <Card className="mt-8 space-y-4">
          <h3 className="type-title">Design Tokens</h3>
            <div>
              <h4 className="type-subtitle">Spacing</h4>
              <p className="type-body">4, 6, 8, 12, 14, 16, 20, 24, 32, 36, 40, 48, 64</p>
            </div>
          <div>
            <h4 className="type-subtitle">Glow</h4>
            <p className="type-body">--glow-strong, --glow-soft</p>
          </div>
          <div>
            <h4 className="type-subtitle">Radius</h4>
            <p className="type-body">--radius</p>
          </div>
          <div>
            <h4 className="type-subtitle">Type Ramp</h4>
            <p className="type-body">eyebrow, title, subtitle, body, caption</p>
          </div>
        </Card>
      </SectionCard.Body>
    </SectionCard>
  );
}
