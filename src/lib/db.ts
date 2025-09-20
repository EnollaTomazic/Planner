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

export { createStorageKey } from "./storage-key";

/** SSR guard */
const isBrowser = typeof window !== "undefined";

declare global {
  interface Window {
    __planner_flush_bound?: boolean;
  }
}

type QueuedWrite =
  | { type: "raw"; value: unknown }
  | { type: "json"; serialized: string };

// Debounced write queue
const writeQueue = new Map<string, QueuedWrite>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;

export let writeLocalDelay = 50;
export function setWriteLocalDelay(ms: number) {
  writeLocalDelay = Math.max(0, ms);
}

function flushWriteQueue() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  for (const [k, entry] of writeQueue) {
    try {
      if (entry.type === "json") {
        if (typeof window === "undefined") continue;
        window.localStorage.setItem(k, entry.serialized);
      } else {
        baseWriteLocal(k, entry.value);
      }
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

function describeNonSerializable(
  value: unknown,
  path = "value",
  stack: Set<object> = new Set(),
): string | null {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "undefined"
  ) {
    return null;
  }

  if (typeof value === "function") {
    return `${path} is a function`;
  }

  if (typeof value === "symbol") {
    return `${path} is a symbol`;
  }

  if (typeof value === "bigint") {
    return `${path} is a bigint`;
  }

  if (typeof value !== "object") {
    return `${path} has unsupported type ${typeof value}`;
  }

  const obj = value as Record<PropertyKey, unknown>;
  if (stack.has(obj)) {
    return `${path} contains a circular reference`;
  }
  stack.add(obj);

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      const issue = describeNonSerializable(obj[i], `${path}[${i}]`, stack);
      if (issue) {
        stack.delete(obj);
        return issue;
      }
    }
    stack.delete(obj);
    return null;
  }

  if (obj instanceof Date) {
    stack.delete(obj);
    return null;
  }

  if (
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet
  ) {
    stack.delete(obj);
    return `${path} is a ${obj.constructor.name}`;
  }

  if (obj instanceof Promise) {
    stack.delete(obj);
    return `${path} is a Promise`;
  }

  if (ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer) {
    stack.delete(obj);
    return null;
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype) {
    if (typeof (obj as { toJSON?: unknown }).toJSON === "function") {
      stack.delete(obj);
      return null;
    }
    const protoName = proto.constructor?.name ?? "object";
    stack.delete(obj);
    return `${path} has unsupported prototype ${protoName}`;
  }

  if (Object.getOwnPropertySymbols(obj).length > 0) {
    stack.delete(obj);
    return `${path} has symbol-keyed properties`;
  }

  for (const [prop, propValue] of Object.entries(
    obj as Record<string, unknown>,
  )) {
    const issue = describeNonSerializable(propValue, `${path}.${prop}`, stack);
    if (issue) {
      stack.delete(obj);
      return issue;
    }
  }

  stack.delete(obj);
  return null;
}

export function scheduleWrite(key: string, value: unknown) {
  let issue: string | null = null;
  if (process.env.NODE_ENV !== "production") {
    issue = describeNonSerializable(value);
  }
  if (issue) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Skipping persistence for "${key}" because ${issue}.`,
        value,
      );
    }
    return;
  }
  let entry: QueuedWrite;
  if (value !== null && typeof value === "object") {
    let serialized: string | null = null;
    try {
      const maybeSerialized = JSON.stringify(value);
      if (typeof maybeSerialized === "string") {
        serialized = maybeSerialized;
      }
    } catch {
      serialized = null;
    }

    if (serialized !== null) {
      entry = { type: "json", serialized };
    } else {
      const clonedValue =
        typeof structuredClone === "function"
          ? (() => {
              try {
                return structuredClone(value);
              } catch {
                return undefined;
              }
            })()
          : undefined;
      if (typeof clonedValue === "undefined") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `Skipping persistence for "${key}" because value could not be cloned.`,
            value,
          );
        }
        return;
      }
      entry = { type: "raw", value: clonedValue };
    }
  } else {
    entry = { type: "raw", value };
  }
  writeQueue.set(key, entry);
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
    const storageKey = createStorageKey(key);
    const value = baseReadLocal<T>(storageKey);
    if (value !== null) return value;
    if (storageKey !== key) {
      const legacyValue = baseReadLocal<T>(`${OLD_STORAGE_PREFIX}${key}`);
      if (legacyValue !== null) return legacyValue;
      const rawValue = baseReadLocal<T>(key);
      if (rawValue !== null) return rawValue;
    }
    return null;
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
  const targets = new Set<string>();
  try {
    targets.add(createStorageKey(key));
  } catch {
    // ignore
  }
  targets.add(key);
  for (const target of targets) {
    try {
      window.localStorage.removeItem(target);
    } catch {
      // ignore
    }
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
type PersistentStateDecode<T> = (value: unknown) => T | null | undefined;
type PersistentStateEncode<T> = (value: T) => unknown;

type PersistentStateOptions<T> = {
  decode?: PersistentStateDecode<T>;
  encode?: PersistentStateEncode<T>;
};

type StoredSnapshot<T> =
  | { kind: "missing" }
  | { kind: "value"; value: T };

function valuesEqual<Value>(a: Value, b: Value): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

export function usePersistentState<T>(
  key: string,
  initial: T,
  options?: PersistentStateOptions<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() => initial);

  const initialRef = React.useRef(initial);
  const stateRef = React.useRef(state);
  const storedSnapshotRef = React.useRef<StoredSnapshot<T>>({
    kind: "missing",
  });
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);
  React.useEffect(() => {
    if (valuesEqual(initialRef.current, initial)) {
      initialRef.current = initial;
      return;
    }
    const previousInitial = initialRef.current;
    initialRef.current = initial;

    if (!loadedRef.current) return;

    const snapshot = storedSnapshotRef.current;
    const hasStoredDiff =
      snapshot.kind === "value" &&
      !valuesEqual(snapshot.value, previousInitial);

    if (!hasStoredDiff) {
      storedSnapshotRef.current = { kind: "missing" };
      if (!valuesEqual(stateRef.current, initial)) {
        setState(initial);
      }
    }
  }, [initial]);

  const decodeRef = React.useRef<PersistentStateDecode<T> | null>(
    options?.decode ?? null,
  );
  const encodeRef = React.useRef<PersistentStateEncode<T> | null>(
    options?.encode ?? null,
  );
  React.useEffect(() => {
    decodeRef.current = options?.decode ?? null;
  }, [options?.decode]);
  React.useEffect(() => {
    encodeRef.current = options?.encode ?? null;
  }, [options?.encode]);

  const decodeValue = React.useCallback(
    (value: unknown): T | null => {
      if (value === null) return null;
      const decode = decodeRef.current;
      if (!decode) return value as T;
      try {
        const result = decode(value);
        if (typeof result === "undefined" || result === null) return null;
        return result;
      } catch {
        return null;
      }
    },
    [],
  );

  const encodeValue = React.useCallback(
    (value: T): unknown => {
      const encode = encodeRef.current;
      if (!encode) return value;
      try {
        return encode(value);
      } catch {
        return value;
      }
    },
    [],
  );

  const fullKeyRef = React.useRef(createStorageKey(key));
  const loadedRef = React.useRef(false);

  React.useEffect(() => {
    const nextFull = createStorageKey(key);
    if (fullKeyRef.current !== nextFull) {
      fullKeyRef.current = nextFull;
      loadedRef.current = false;
      storedSnapshotRef.current = { kind: "missing" };
    }
  }, [key]);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) {
      let fromStorage = baseReadLocal<unknown>(fullKeyRef.current);
      if (fromStorage === null) {
        fromStorage = baseReadLocal<unknown>(`${OLD_STORAGE_PREFIX}${key}`);
      }
      if (fromStorage !== null) {
        const decoded = decodeValue(fromStorage);
        if (decoded !== null) {
          storedSnapshotRef.current = { kind: "value", value: decoded };
          if (!valuesEqual(stateRef.current, decoded)) setState(decoded);
        } else {
          storedSnapshotRef.current = { kind: "missing" };
          if (!valuesEqual(stateRef.current, initialRef.current))
            setState(initialRef.current);
        }
      } else {
        storedSnapshotRef.current = { kind: "missing" };
        if (!valuesEqual(stateRef.current, initialRef.current))
          setState(initialRef.current);
      }
      loadedRef.current = true;
    }
  }, [key, decodeValue]);

  const handleExternal = React.useCallback((raw: string | null) => {
    if (raw === null) {
      storedSnapshotRef.current = { kind: "missing" };
      if (!valuesEqual(stateRef.current, initialRef.current))
        setState(initialRef.current);
      return;
    }
    const parsed = parseJSON<unknown>(raw);
    if (parsed === null) return;
    const decoded = decodeValue(parsed);
    if (decoded !== null) {
      storedSnapshotRef.current = { kind: "value", value: decoded };
      if (!valuesEqual(stateRef.current, decoded)) setState(decoded);
      return;
    }
    storedSnapshotRef.current = { kind: "missing" };
    if (!valuesEqual(stateRef.current, initialRef.current))
      setState(initialRef.current);
  }, [decodeValue]);

  useStorageSync(key, handleExternal);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) return;
    try {
      const snapshot = storedSnapshotRef.current;
      if (snapshot.kind === "value" && valuesEqual(snapshot.value, state)) {
        return;
      }
      const encoded = encodeValue(state);
      scheduleWrite(fullKeyRef.current, encoded);
      storedSnapshotRef.current = { kind: "value", value: state };
    } catch {
      // ignore
    }
  }, [state, encodeValue]);

  return [state, setState];
}

/**
 * Generates a random suffix using `crypto.getRandomValues` when available.
 */
function cryptoRandomSuffix(cryptoObj?: Crypto): string {
  if (!cryptoObj?.getRandomValues) return "";
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(36).padStart(2, "0");
  }
  return result;
}

/**
 * Generates a unique identifier using `crypto.randomUUID`.
 * If a prefix is provided, it is prepended followed by an underscore.
 */
let uidCounter = 0;
export function uid(prefix = ""): string {
  const cryptoObj = globalThis.crypto;
  const id =
    cryptoObj?.randomUUID?.() ??
    `${Date.now().toString(36)}${(uidCounter++).toString(36)}${cryptoRandomSuffix(
      cryptoObj,
    )}`;
  return prefix ? `${prefix}_${id}` : id;
}
