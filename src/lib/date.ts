// Shared date helpers for planner components

import { LOCALE } from "./utils";

export const shortDate = new Intl.DateTimeFormat(LOCALE, {
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

/** Predicate for "YYYY-MM-DD" */
export function isISODate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Parse "YYYY-MM-DD" into a Date at local midnight. Returns null if invalid. */
export function fromISODate(iso: string): Date | null {
  if (!isISODate(iso)) return null;
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (!Number.isFinite(dt.getTime())) return null;
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
    ? dt
    : null;
}

/** Normalize various inputs to a valid Date (fallback = now). */
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

/** toISODate — Returns local date in "YYYY-MM-DD". */
export function toISODate(d?: Date | number | string): string {
  const date = normalizeDate(d);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function mondayStartOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7; // shift so Monday=0
  copy.setHours(0, 0, 0, 0);
  return addDays(copy, -diff);
}

export function sundayEndOfWeek(d: Date): Date {
  const start = mondayStartOfWeek(d);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function weekRangeFromISO(iso: string): { start: Date; end: Date } {
  const d = fromISODate(iso) ?? new Date();
  return { start: mondayStartOfWeek(d), end: sundayEndOfWeek(d) };
}
