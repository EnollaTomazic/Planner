"use client";

import { usePromptLibrary } from "./usePromptLibrary";

export const CHAT_PROMPTS_STORAGE_KEY = "prompts.chat.v1" as const;

export function useChatPrompts() {
  return usePromptLibrary(CHAT_PROMPTS_STORAGE_KEY);
}
