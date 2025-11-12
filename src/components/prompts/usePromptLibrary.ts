"use client";

import * as React from "react";
import type Fuse from "fuse.js";
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

const EMPTY_PROMPT_LIST: Prompt[] = [];

export function usePromptLibrary(storageKey: string) {
  const [prompts, setPrompts] = usePersistentState<Prompt[]>(
    storageKey,
    EMPTY_PROMPT_LIST,
    {
      decode: decodePrompts,
    },
  );
  const [query, setQuery] = React.useState("");

  const withTitles = React.useMemo(
    () => prompts.map((prompt) => ({ ...prompt, title: derivePromptTitle(prompt) })),
    [prompts],
  );

  const fuseModulePromiseRef = React.useRef<Promise<typeof import("fuse.js")> | null>(null);
  const fuseRef = React.useRef<Fuse<PromptWithTitle> | null>(null);

  const [filtered, setFiltered] = React.useState<PromptWithTitle[]>(withTitles);

  const ensureFuse = React.useCallback(async () => {
    if (!fuseModulePromiseRef.current) {
      fuseModulePromiseRef.current = import("fuse.js");
    }
    const { default: FuseModule } = await fuseModulePromiseRef.current;
    if (fuseRef.current) {
      fuseRef.current.setCollection(withTitles);
      return fuseRef.current;
    }
    const instance = new FuseModule<PromptWithTitle>(withTitles, {
      keys: ["title", "text"],
      threshold: 0.3,
    });
    fuseRef.current = instance;
    return instance;
  }, [withTitles]);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setFiltered(withTitles);
      return;
    }

    let cancelled = false;

    if (!fuseRef.current) {
      const lowered = trimmed.toLowerCase();
      setFiltered(
        withTitles.filter((prompt) => {
          return (
            prompt.title.toLowerCase().includes(lowered) ||
            prompt.text.toLowerCase().includes(lowered)
          );
        }),
      );
    }

    const runSearch = async () => {
      const fuse = await ensureFuse();
      if (cancelled) return;
      const results = fuse.search(trimmed);
      if (cancelled) return;
      setFiltered(results.map((res) => res.item));
    };

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [ensureFuse, query, withTitles]);

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

  const update = React.useCallback(
    (id: string, titleDraft: string, textDraft: string) => {
      const text = textDraft.trim();
      const title =
        titleDraft.trim() || text.split(/\r?\n/)[0]?.trim() || "Untitled";
      if (!text && !titleDraft.trim()) return false;
      let didUpdate = false;
      setPrompts((prev) =>
        prev.map((prompt) => {
          if (prompt.id !== id) return prompt;
          didUpdate = true;
          return { ...prompt, title, text } satisfies Prompt;
        }),
      );
      return didUpdate;
    },
    [setPrompts],
  );

  const remove = React.useCallback(
    (id: string) => {
      let didRemove = false;
      setPrompts((prev) => {
        const next = prev.filter((prompt) => {
          const keep = prompt.id !== id;
          if (!keep) {
            didRemove = true;
          }
          return keep;
        });
        return next;
      });
      return didRemove;
    },
    [setPrompts],
  );

  return { prompts, query, setQuery, filtered, save, update, remove } as const;
}
