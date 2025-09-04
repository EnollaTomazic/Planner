// src/lib/utils.ts
// Tiny helpers. Keep dependencies minimal and SSR-safe.

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, unknown>;

/** clsx/tw-merge–style combiner with no deps. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue): void => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      const s = String(v).trim();
      if (s) out.push(s);
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) walk(x);
      return;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const dict = v as Record<string, unknown>;
      // Only iterate over an object's own enumerable properties to avoid
      // leaking prototype keys into the class list.
      for (const [k, val] of Object.entries(dict)) {
        if (val) out.push(k);
      }
      return;
    }
  };
  for (const i of inputs) walk(i);
  return out.join(" ");
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

