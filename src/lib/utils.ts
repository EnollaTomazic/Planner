// src/lib/utils.ts
// Tiny helpers. Keep dependencies minimal and SSR-safe.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Default locale for consistent date/time formatting.
export const LOCALE = "en-US";

/** Combine class names using clsx and tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Capitalize first letter (not Unicode-smart on purpose). */
export function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Clamp number to a range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * toISODate — Returns local date in "YYYY-MM-DD".
 * Accepts Date | timestamp | date-like string. Falls back to today on invalid.
 * Note: uses local time (planner/week UX expects local).
 */
export function toISODate(d?: Date | number | string): string {
  const date = normalizeDate(d);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" into a Date at local midnight. Returns null if invalid. */
export function fromISODate(iso: string): Date | null {
  if (!isISODate(iso)) return null;
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (!Number.isFinite(dt.getTime())) return null;
  // Guard against JS Date rolling over invalid dates like "2023-02-31" -> Mar 3
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
    ? dt
    : null;
}

/** Predicate for "YYYY-MM-DD". */
export function isISODate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Normalize a variety of inputs to a valid Date (fallback = now). */
export function normalizeDate(src?: Date | number | string): Date {
  let dt: Date;
  if (src instanceof Date) {
    dt = new Date(src);
  } else if (typeof src === "number") {
    dt = new Date(src);
  } else if (typeof src === "string") {
    const maybeISO = isISODate(src) ? fromISODate(src) : null;
    dt = maybeISO ?? new Date(src);
  } else {
    dt = new Date();
  }
  if (!Number.isFinite(dt.getTime())) dt = new Date();
  return dt;
}

/** Create a URL-friendly slug from a string. */
export function slugify(s?: string): string {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 64);
}

/**
 * sanitizeText — remove HTML brackets to prevent node injection.
 * Minimal on purpose; more heavy sanitizers can be added if needed.
 */
export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "");
}

