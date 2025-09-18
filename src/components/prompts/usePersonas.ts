"use client";

import { usePersistentState } from "@/lib/db";
import type { Persona } from "./types";

export const PROMPT_PERSONAS_STORAGE_KEY = "prompts.personas.v1" as const;

export function usePersonas() {
  return usePersistentState<Persona[]>(PROMPT_PERSONAS_STORAGE_KEY, []);
}
