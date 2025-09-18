"use client";

import { usePersistentState } from "@/lib/db";

export const PROMPT_NOTES_STORAGE_KEY = "prompts.notes.v1" as const;

export function useNotes() {
  return usePersistentState<string>(PROMPT_NOTES_STORAGE_KEY, "");
}
