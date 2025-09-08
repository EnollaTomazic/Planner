// src/lib/db.ts
// Local-first helpers for Noxis Planner
// - Hydration-safe: first render returns `initial`; no localStorage read until after mount
// - SSR-safe: never touches window/localStorage on the server
// - Tiny and predictable

"use client";

import * as React from "react";

/** Namespacing so we don't collide with other apps in the same domain */
const STORAGE_PREFIX = "noxis-planner:";

// Previous prefix used in older builds; retained for migration
const OLD_STORAGE_PREFIX = "13lr:";

/** SSR guard */
const isBrowser = typeof window !== "undefined";

// Migrate any legacy keys from older builds
function ensureMigration() {
  if (!isBrowser) return;
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(OLD_STORAGE_PREFIX)) legacyKeys.push(key);
    }
    for (const oldKey of legacyKeys) {
      const newKey = `${STORAGE_PREFIX}${oldKey.slice(OLD_STORAGE_PREFIX.length)}`;
      if (window.localStorage.getItem(newKey) === null) {
        const value = window.localStorage.getItem(oldKey);
        if (value !== null) window.localStorage.setItem(newKey, value);
      }
      window.localStorage.removeItem(oldKey);
    }
  } catch {
    // ignore
  }
}

/** Build a fully namespaced key and ensure migrations */
export function createStorageKey(key: string): string {
  ensureMigration();
  return `${STORAGE_PREFIX}${key}`;
}

/** Safe JSON parse */
function parseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Safe JSON stringify */
function toJSON(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return JSON.stringify({ __unserializable: true, at: Date.now() });
  }
}

/** Read from localStorage without throwing on SSR or privacy modes */
export function readLocal<T>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    return parseJSON<T>(window.localStorage.getItem(createStorageKey(key)));
  } catch {
    return null;
  }
}

/** Write to localStorage safely */
export function writeLocal(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(createStorageKey(key), toJSON(value));
  } catch {
    // ignore quota/privacy errors
  }
}

/** Remove a key from localStorage safely */
export function removeLocal(key: string) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(createStorageKey(key));
  } catch {
    // ignore
  }
}

/**
 * Listen for changes to a localStorage key and notify via callback.
 */
export function useStorageSync(
  key: string,
  onChange: (raw: string | null) => void,
) {
  React.useEffect(() => {
    if (!isBrowser) return;
    const fullKey = createStorageKey(key);
    const handler = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== fullKey) return;
      onChange(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, onChange]);
}

/**
 * usePersistentState<T>(key, initial)
 * Hydration-safe local state that:
 *  - Returns `initial` on first render (no storage reads during SSR/hydration)
 *  - After mount, loads from localStorage (if present) and replaces state.
 *  - Any change to state is persisted to localStorage.
 *  - Cross-tab: uses `useStorageSync` to stay in sync.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(initial);

  const initialRef = React.useRef(initial);
  React.useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  const fullKeyRef = React.useRef(createStorageKey(key));
  const loadedRef = React.useRef(false);

  React.useEffect(() => {
    const nextFull = createStorageKey(key);
    if (fullKeyRef.current !== nextFull) {
      fullKeyRef.current = nextFull;
      loadedRef.current = false;
    }
  }, [key]);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) {
      const fromStorage = parseJSON<T>(
        window.localStorage.getItem(fullKeyRef.current),
      );
      if (fromStorage !== null) setState(fromStorage);
      loadedRef.current = true;
    }
  }, [key]);

  const handleExternal = React.useCallback(
    (raw: string | null) => {
      if (raw === null) {
        setState(initialRef.current);
        return;
      }
      const next = parseJSON<T>(raw);
      if (next !== null) setState(next);
    },
    [],
  );

  useStorageSync(key, handleExternal);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) return;
    try {
      window.localStorage.setItem(fullKeyRef.current, toJSON(state));
    } catch {
      // ignore
    }
  }, [state]);

  return [state, setState];
}

/**
 * Tiny uid helper.
 * Uses `crypto.randomUUID` when available; falls back to `Math.random`.
 * Example: "review_123e4567e89b12d3"
 */
export function uid(prefix = "id"): string {
  const id =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : (
          Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2)
        ).slice(0, 16);
  return `${prefix}_${id}`;
}

