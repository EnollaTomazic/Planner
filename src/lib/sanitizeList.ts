// src/lib/sanitizeList.ts
// Helpers for working with sanitized string arrays.

import { sanitizeText } from "./utils";

/** Sanitize a list of strings using sanitizeText. */
export function sanitizeList(input: string[]): string[] {
  return input.map((item) => sanitizeText(item));
}
