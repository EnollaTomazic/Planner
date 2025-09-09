"use client";

import * as React from "react";
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

