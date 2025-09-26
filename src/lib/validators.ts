// src/lib/validators.ts
// Shared runtime type guards and validators.

export function isRecord<T = unknown>(value: unknown): value is Record<string, T> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function safeNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}
