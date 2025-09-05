// src/lib/date.ts
// Shared date helpers for planner components

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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
  const d = isoToDate(iso);
  return { start: mondayStartOfWeek(d), end: sundayEndOfWeek(d) };
}
