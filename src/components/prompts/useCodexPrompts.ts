"use client";

import { usePromptLibrary } from "./usePromptLibrary";

export const CODEX_PROMPTS_STORAGE_KEY = "prompts.codex.v1" as const;

export function useCodexPrompts() {
  return usePromptLibrary(CODEX_PROMPTS_STORAGE_KEY);
}
