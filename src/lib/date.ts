// src/lib/date.ts
// Shared date helpers for planner components

import { LOCALE } from "./utils";

export const shortDate = new Intl.DateTimeFormat(LOCALE, {
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

const weekDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
});

const isoLabelWeekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
});

const isoLabelMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
});

const isoLabelDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
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

export function formatWeekDay(iso: string): string {
  const dt = fromISODate(iso);
  if (!dt) return iso;
  return weekDayFormatter.format(dt);
}

export function formatIsoLabel(iso: string): string {
  const dt = fromISODate(iso);
  if (!dt) return iso;
  const weekday = isoLabelWeekdayFormatter
    .format(dt)
    .toLocaleUpperCase(LOCALE);
  const month = isoLabelMonthFormatter
    .format(dt)
    .toLocaleUpperCase(LOCALE);
  const day = isoLabelDayFormatter.format(dt);
  return `${weekday}_${month} :: ${day}`;
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

/**
 * ts — Normalize various inputs to a numeric timestamp (ms).
 * Returns 0 for invalid values.
 */
export function ts(v: unknown): number {
  if (typeof v === "number") return v;
  if (v instanceof Date) return +v;
  if (typeof v === "string") {
    const n = Date.parse(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
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

type FormatMmSsOptions = {
  padMinutes?: boolean;
};

/**
 * formatMmSs — Format a duration in seconds as "mm:ss".
 * Minutes default to two digits but can be left unpadded.
 */
export function formatMmSs(
  totalSeconds: number,
  options?: FormatMmSsOptions,
): string {
  const { padMinutes = true } = options ?? {};
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const mm = padMinutes ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * parseMmSs — Parse "mm:ss" into total seconds. Returns null if invalid.
 */
export function parseMmSs(value: string): number | null {
  const match = value.trim().match(/^(\d{1,3})\s*:\s*([0-5]?\d)$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
}
