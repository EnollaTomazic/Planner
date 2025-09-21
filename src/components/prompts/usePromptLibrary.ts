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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodePrompt(value: unknown): Prompt | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const text = value["text"];
  const createdAt = value["createdAt"];
  if (typeof id !== "string") return null;
  if (typeof text !== "string") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  const prompt: Prompt = { id, text, createdAt };
  const title = value["title"];
  if (typeof title === "string") {
    prompt.title = title;
  }
  return prompt;
}

export function decodePrompts(value: unknown): Prompt[] | null {
  if (!Array.isArray(value)) return null;
  const result: Prompt[] = [];
  for (const entry of value) {
    const prompt = decodePrompt(entry);
    if (prompt) result.push(prompt);
  }
  return result;
}

export function usePromptLibrary(storageKey: string) {
  const [prompts, setPrompts] = usePersistentState<Prompt[]>(storageKey, [], {
    decode: decodePrompts,
  });
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
