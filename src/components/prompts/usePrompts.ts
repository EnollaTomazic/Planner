"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { usePersistentState, uid } from "@/lib/db";

export type Prompt = {
  id: string;
  title?: string;
  text: string;
  createdAt: number;
};

export type PromptWithTitle = Prompt & { title: string };

export function usePrompts() {
  const [prompts, setPrompts] = usePersistentState<Prompt[]>("prompts.v1", []);
  const [query, setQuery] = React.useState("");

  const deriveTitle = React.useCallback((p: Prompt) => {
    if (p.title && p.title.trim()) return p.title.trim();
    const firstLine = (p.text || "").split(/\r?\n/)[0]?.trim() || "";
    return firstLine || "Untitled";
  }, []);

  const withTitles = React.useMemo(
    () => prompts.map((p) => ({ ...p, title: deriveTitle(p) })),
    [prompts, deriveTitle],
  );

  const fuse = React.useMemo(
    () => new Fuse(withTitles, { keys: ["title", "text"], threshold: 0.3 }),
    [withTitles],
  );

  const filtered: PromptWithTitle[] = React.useMemo(() => {
    const q = query.trim();
    if (!q) return withTitles;
    return fuse.search(q).map((res) => res.item);
  }, [fuse, query, withTitles]);

  const save = React.useCallback(
    (titleDraft: string, textDraft: string) => {
      const text = textDraft.trim();
      const title =
        titleDraft.trim() || text.split(/\r?\n/)[0]?.trim() || "Untitled";
      if (!text && !titleDraft.trim()) return false;
      const next: Prompt = {
        id: uid("p"),
        title,
        text,
        createdAt: Date.now(),
      };
      setPrompts((prev) => [next, ...prev]);
      return true;
    },
    [setPrompts],
  );

  return { prompts, query, setQuery, filtered, save } as const;
}

