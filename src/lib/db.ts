// src/lib/db.ts
// Local-first helpers for 13 League Review
// - Hydration-safe: first render returns `initial`; no localStorage read until after mount
// - SSR-safe: never touches window/localStorage on the server
// - Cross-tab sync: listens to `storage` and updates state if another tab writes
// - Tiny and predictable

"use client";

import * as React from "react";

/** Namespacing so we don't collide with other apps in the same domain */
const STORAGE_PREFIX = "13lr:";

/** SSR guard */
const isBrowser = typeof window !== "undefined";

/** Build a fully namespaced key */
const sk = (key: string) => `${STORAGE_PREFIX}${key}`;

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
    return parseJSON<T>(window.localStorage.getItem(sk(key)));
  } catch {
    return null;
  }
}

/** Write to localStorage safely */
export function writeLocal(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(sk(key), toJSON(value));
  } catch {
    // ignore quota/privacy errors
  }
}

/** Remove a key from localStorage safely */
export function removeLocal(key: string) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(sk(key));
  } catch {
    // ignore
  }
}

/**
 * useLocalDB<T>(key, initial)
 * Hydration-safe local state that:
 *  - Returns `initial` on first render (no storage reads during SSR/hydration)
 *  - After mount, loads from localStorage (if present) and replaces state.
 *  - Any change to state is persisted to localStorage.
 *  - Cross-tab: listens for `storage` events and replaces state when same key changes.
 */
export function useLocalDB<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(initial);

  // Keep the latest initial value for resets
  const initialRef = React.useRef(initial);
  React.useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  // Track whether we've mounted and whether we performed the initial load
  const loadedRef = React.useRef(false);
  const fullKeyRef = React.useRef(sk(key));

  // If the caller passes a different key later, update the ref and trigger a reload
  React.useEffect(() => {
    const nextFull = sk(key);
    if (fullKeyRef.current !== nextFull) {
      fullKeyRef.current = nextFull;
      loadedRef.current = false; // force reload for new key
    }
  }, [key]);

  // After mount: load once, wire cross-tab sync
  React.useEffect(() => {
    if (!isBrowser) return;

    // Load once after mount or after key change
    if (!loadedRef.current) {
      const fromStorage = parseJSON<T>(window.localStorage.getItem(fullKeyRef.current));
      if (fromStorage !== null) setState(fromStorage);
      loadedRef.current = true;
    }

    // Cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== fullKeyRef.current) return;
      if (e.newValue === null) {
        setState(initialRef.current);
        return;
      }
      const next = parseJSON<T>(e.newValue);
      if (next !== null) setState(next);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  // Persist whenever state changes after the initial load
  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) return; // do not write during the initial load window
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
