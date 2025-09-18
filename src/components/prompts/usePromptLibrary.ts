"use client";

import * as React from "react";
import Fuse from "fuse.js";
import type { FuseResult } from "fuse.js";
import { usePersistentState, uid } from "@/lib/db";
import {
  derivePromptTitle,
  type Prompt,
  type PromptWithTitle,
} from "./types";

export function usePromptLibrary(storageKey: string) {
  const [prompts, setPrompts] = usePersistentState<Prompt[]>(storageKey, []);
  const [query, setQuery] = React.useState("");

  const withTitles = React.useMemo(
    () => prompts.map((prompt) => ({ ...prompt, title: derivePromptTitle(prompt) })),
    [prompts],
  );

  const fuse = React.useMemo(
    () =>
      new Fuse(withTitles, {
        keys: ["title", "text"],
        threshold: 0.3,
      }),
    [withTitles],
  );

  const filtered: PromptWithTitle[] = React.useMemo(() => {
    const q = query.trim();
    if (!q) return withTitles;
    return fuse.search(q).map((res: FuseResult<PromptWithTitle>) => res.item);
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
