// src/lib/base-path.ts
// Shared helpers for normalizing Next.js base paths across runtimes.

/**
 * Normalize a Next.js base path value so it always resolves to either
 * an empty string (no base path) or a leading-slash-prefixed path without
 * trailing slashes. Accepts undefined/null/empty strings and tolerates
 * surrounding whitespace.
 */
export function normalizeBasePath(raw: string | undefined | null): string {
  if (raw == null) {
    return "";
  }

  const trimmed = raw.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  const segments = trimmed
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return "";
  }

  return `/${segments.join("/")}`;
}
