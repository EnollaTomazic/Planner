// src/lib/utils.ts
// Tiny helpers. Keep dependencies minimal and SSR-safe.

import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import loadClientEnv from "../../env/client";

function readClientEnv(): ReturnType<typeof loadClientEnv> {
  try {
    return loadClientEnv();
  } catch (error) {
    console.error("[env] Failed to load client environment variables.", error);
    if (
      typeof process !== "undefined" &&
      typeof process.exit === "function" &&
      process.env.NODE_ENV !== "test"
    ) {
      process.exit(1);
    }
    throw error;
  }
}

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["label", "ui", "body", "title", "title-lg"],
    },
  },
});

function normalizeBasePath(raw: string | undefined): string {
  if (!raw) {
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

const { NEXT_PUBLIC_BASE_PATH } = readClientEnv();

const NORMALIZED_BASE = normalizeBasePath(NEXT_PUBLIC_BASE_PATH);

export function getBasePath(): string {
  return NORMALIZED_BASE;
}

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isAbsoluteUrl(path: string): boolean {
  return ABSOLUTE_URL_PATTERN.test(path) || path.startsWith("//");
}

// Default locale for consistent date/time formatting.
export const LOCALE = "en-US";

/** Combine class names using clsx and tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Prefix a path with the configured Next.js base path, if any.
 * Ensures consistent asset URLs for environments served from sub-paths.
 */
export function withBasePath(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return NORMALIZED_BASE ? `${NORMALIZED_BASE}/` : "/";
  }

  if (trimmedPath.startsWith("#") || trimmedPath.startsWith("?")) {
    return trimmedPath;
  }
  const normalizedPath = trimmedPath.startsWith("/")
    ? trimmedPath
    : `/${trimmedPath}`;

  if (!NORMALIZED_BASE) {
    return normalizedPath;
  }

  if (
    normalizedPath === NORMALIZED_BASE ||
    normalizedPath === `${NORMALIZED_BASE}/` ||
    normalizedPath.startsWith(`${NORMALIZED_BASE}/`)
  ) {
    return normalizedPath;
  }

  return `${NORMALIZED_BASE}${normalizedPath}`;
}

/** Remove the configured base path prefix from a pathname. */
export function withoutBasePath(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!NORMALIZED_BASE) {
    return normalizedPath;
  }

  if (
    normalizedPath === NORMALIZED_BASE ||
    normalizedPath === `${NORMALIZED_BASE}/`
  ) {
    return "/";
  }

  if (normalizedPath.startsWith(`${NORMALIZED_BASE}/`)) {
    const remainder = normalizedPath.slice(NORMALIZED_BASE.length);
    return remainder.length > 0 ? remainder : "/";
  }

  return normalizedPath;
}

/** Capitalize first letter (not Unicode-smart on purpose). */
export function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Clamp number to a range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Date helpers moved to ./date.ts

/** Create a URL-friendly slug from a string. */
export function slugify(s?: string): string {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 64);
}

/** Escape mappings for sanitizeText */
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\u0022": "&quot;",
  "'": "&#39;",
} as const;

/**
 * Clone data using structuredClone with JSON fallback.
 * Returns undefined when cloning fails.
 */
export function safeClone<T>(value: T): T | undefined {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // fall through to JSON
    }
  }
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return undefined;
  }
}

/**
 * sanitizeText — escape HTML-unsafe characters to prevent node injection.
 * Minimal on purpose; more heavy sanitizers can be added if needed.
 */
export function sanitizeText(input: string): string {
  return input.replace(
    /[&<>"']/g,
    (c) => HTML_ESCAPE_MAP[c as keyof typeof HTML_ESCAPE_MAP] ?? c,
  );
}
