// src/lib/db.ts
// Local-first helpers for Noxis Planner
// - Hydration-safe: first render returns `initial`; no localStorage read until after mount
// - SSR-safe: never touches window/localStorage on the server
// - Tiny and predictable

"use client";

import * as React from "react";
import {
  parseJSON,
  readLocal as baseReadLocal,
  writeLocal as baseWriteLocal,
} from "./local-bootstrap";
import { createStorageKey, OLD_STORAGE_PREFIX } from "./storage-key";
import { safeClone } from "./utils";

export { createStorageKey } from "./storage-key";

/** SSR guard */
const isBrowser = typeof window !== "undefined";

declare global {
  interface Window {
    __planner_flush_bound?: boolean;
  }
}

// Debounced write queue
const writeQueue = new Map<string, unknown>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;

export let writeLocalDelay = 50;
export function setWriteLocalDelay(ms: number) {
  writeLocalDelay = ms;
}

function flushWriteQueue() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  for (const [k, v] of writeQueue) {
    try {
      baseWriteLocal(k, v);
    } catch {
      // ignore
    }
  }
  writeQueue.clear();
}

export function flushWriteLocal() {
  if (!isBrowser) return;
  flushWriteQueue();
}

export function scheduleWrite(key: string, value: unknown) {
  const persistedValue =
    value !== null && (typeof value === "object" || typeof value === "function")
      ? safeClone(value)
      : value;
  writeQueue.set(key, persistedValue);
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(flushWriteQueue, writeLocalDelay);
}

if (isBrowser && !window.__planner_flush_bound) {
  window.addEventListener("beforeunload", flushWriteQueue);
  window.addEventListener("pagehide", flushWriteQueue);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushWriteQueue();
  });
  window.__planner_flush_bound = true;
}

/** Read from localStorage without throwing on SSR or privacy modes */
export function readLocal<T>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    return baseReadLocal<T>(createStorageKey(key));
  } catch {
    return null;
  }
}

/** Write to localStorage safely */
export function writeLocal(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    scheduleWrite(createStorageKey(key), value);
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
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);
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
      let fromStorage = baseReadLocal<T>(fullKeyRef.current);
      if (fromStorage === null) {
        fromStorage = baseReadLocal<T>(`${OLD_STORAGE_PREFIX}${key}`);
      }
      if (fromStorage !== null) {
        if (!Object.is(stateRef.current, fromStorage)) setState(fromStorage);
      } else {
        if (!Object.is(stateRef.current, initialRef.current))
          setState(initialRef.current);
      }
      loadedRef.current = true;
    }
  }, [key]);

  const handleExternal = React.useCallback((raw: string | null) => {
    if (raw === null) {
      if (!Object.is(stateRef.current, initialRef.current))
        setState(initialRef.current);
      return;
    }
    const next = parseJSON<T>(raw);
    if (next !== null && !Object.is(stateRef.current, next)) setState(next);
  }, []);

  useStorageSync(key, handleExternal);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) return;
    try {
      scheduleWrite(fullKeyRef.current, state);
    } catch {
      // ignore
    }
  }, [state]);

  return [state, setState];
}

/**
 * Generates a unique identifier using `crypto.randomUUID`.
 * If a prefix is provided, it is prepended followed by an underscore.
 */
let uidCounter = 0;
export function uid(prefix = ""): string {
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}${(uidCounter++).toString(
      36,
    )}${Math.random().toString(36).slice(2)}`;
  return prefix ? `${prefix}_${id}` : id;
}
