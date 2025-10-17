"use client";

import { usePersistentState } from "@/lib/db";
import type { Persona } from "./types";

export const PROMPT_PERSONAS_STORAGE_KEY = "prompts.personas.v1" as const;
const EMPTY_PERSONA_LIST: Persona[] = [];

export function usePersonas() {
  return usePersistentState<Persona[]>(
    PROMPT_PERSONAS_STORAGE_KEY,
    EMPTY_PERSONA_LIST,
  );
}
