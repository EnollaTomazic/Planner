// src/lib/utils.ts
// Tiny helpers. Keep dependencies minimal and SSR-safe.

import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { readClientEnv } from "./load-client-env";

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

type NextWindow = Window & {
  next?: {
    router?: {
      basePath?: string;
    };
  };
};

let cachedRuntimeBasePath: string | undefined;

function normalizeRuntimeBasePath(
  candidate: string | null | undefined,
): string | null {
  if (candidate == null) {
    return null;
  }

  const normalized = normalizeBasePath(candidate);

  if (normalized.length > 0) {
    return normalized;
  }

  const trimmed = candidate.trim();

  if (trimmed.length === 0 || trimmed === "/") {
    return "";
  }

  return null;
}

function readRuntimeBasePath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const runtimeRouterBase = normalizeRuntimeBasePath(
    (window as NextWindow).next?.router?.basePath,
  );

  if (runtimeRouterBase !== null) {
    return runtimeRouterBase;
  }

  const attributeBase = normalizeRuntimeBasePath(
    window.document?.documentElement?.getAttribute?.("data-base-path"),
  );

  if (attributeBase !== null) {
    return attributeBase;
  }

  return null;
}

export function getBasePath(): string {
  if (typeof window !== "undefined") {
    if (cachedRuntimeBasePath !== undefined) {
      return cachedRuntimeBasePath;
    }

    const runtimeBase = readRuntimeBasePath();

    if (runtimeBase !== null) {
      cachedRuntimeBasePath = runtimeBase;
      return runtimeBase;
    }
  }

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
    const basePath = getBasePath();
    return basePath ? `${basePath}/` : "/";
  }

  if (trimmedPath.startsWith("#") || trimmedPath.startsWith("?")) {
    return trimmedPath;
  }
  const normalizedPath = trimmedPath.startsWith("/")
    ? trimmedPath
    : `/${trimmedPath}`;

  const basePath = getBasePath();

  if (!basePath) {
    return normalizedPath;
  }

  if (
    normalizedPath === basePath ||
    normalizedPath === `${basePath}/` ||
    normalizedPath.startsWith(`${basePath}/`) ||
    normalizedPath.startsWith(`${basePath}?`) ||
    normalizedPath.startsWith(`${basePath}#`)
  ) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}

/** Remove the configured base path prefix from a pathname. */
export function withoutBasePath(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const basePath = getBasePath();

  if (!basePath) {
    return normalizedPath;
  }

  if (
    normalizedPath === basePath ||
    normalizedPath === `${basePath}/`
  ) {
    return "/";
  }

  if (normalizedPath.startsWith(`${basePath}/`)) {
    const remainder = normalizedPath.slice(basePath.length);
    return remainder.length > 0 ? remainder : "/";
  }

  if (
    normalizedPath.startsWith(`${basePath}?`) ||
    normalizedPath.startsWith(`${basePath}#`)
  ) {
    const remainder = normalizedPath.slice(basePath.length);
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
