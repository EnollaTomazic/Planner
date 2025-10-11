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
  stringifyWithBinary,
} from "./local-bootstrap";
import { persistenceLogger } from "./logging";
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
    } catch (error) {
      persistenceLogger.warn(
        `Failed to flush write for "${k}"; dropping queued value.`,
        error,
      );
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
    persistenceLogger.warn(
      `Skipping persistence for "${key}" because ${issue}.`,
      value,
    );
    return;
  }
  let entry: QueuedWrite;
  if (value !== null && typeof value === "object") {
    let serialized: string | null = null;
    try {
      serialized = stringifyWithBinary(value);
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
        persistenceLogger.warn(
          `Skipping persistence for "${key}" because value could not be cloned.`,
          value,
        );
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
  } catch (error) {
    persistenceLogger.warn(
      `readLocal("${key}") failed; returning null.`,
      error,
    );
    return null;
  }
}

/** Write to localStorage safely */
export function writeLocal(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    scheduleWrite(createStorageKey(key), value);
  } catch (error) {
    persistenceLogger.warn(
      `writeLocal("${key}") failed; ignoring value due to storage restrictions.`,
      error,
    );
  }
}

/** Remove a key from localStorage safely */
export function removeLocal(key: string) {
  if (!isBrowser) return;
  const targets = new Set<string>();
  try {
    targets.add(createStorageKey(key));
  } catch (error) {
    persistenceLogger.warn(
      `removeLocal("${key}") could not resolve namespaced key.`,
      error,
    );
  }
  targets.add(`${OLD_STORAGE_PREFIX}${key}`);
  targets.add(key);
  for (const target of targets) {
    try {
      window.localStorage.removeItem(target);
    } catch (error) {
      persistenceLogger.warn(
        `removeLocal("${target}") failed; continuing cleanup.`,
        error,
      );
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

export function usePersistentState<T>(
  key: string,
  initial: T,
  options?: PersistentStateOptions<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() => initial);

  const initialRef = React.useRef(initial);
  const stateRef = React.useRef(state);
  const stateRevisionRef = React.useRef(0);
  const lastAppliedInitialSignatureRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    stateRef.current = state;
    stateRevisionRef.current += 1;
  }, [state]);

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

  const computeSignature = React.useCallback(
    (value: T): string | null => {
      try {
        const encode = encodeRef.current;
        const encoded = encode ? encode(value) : value;
        return stringifyWithBinary(encoded);
      } catch {
        return null;
      }
    },
    [],
  );

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
  const pendingPersistenceRef = React.useRef(false);
  const hasHydratedRef = React.useRef(false);
  const pendingInitialResetKeyRef = React.useRef<string | null>(key);
  const lastAppliedInitialRef = React.useRef<T | null>(initial);
  const ignoreNextStorageHydrationRef = React.useRef(false);
  const renderRevision = stateRevisionRef.current;

  React.useEffect(() => {
    const nextFull = createStorageKey(key);
    if (fullKeyRef.current !== nextFull) {
      fullKeyRef.current = nextFull;
      loadedRef.current = false;
      hasHydratedRef.current = false;
      pendingInitialResetKeyRef.current = key;
      pendingPersistenceRef.current = false;
    }
  }, [key]);

  React.useEffect(() => {
    const previousAppliedInitial = lastAppliedInitialRef.current;
    const initialChanged = !Object.is(initialRef.current, initial);
    if (initialChanged) {
      initialRef.current = initial;
      let stateMatchesAppliedInitial =
        previousAppliedInitial !== null &&
        Object.is(stateRef.current, previousAppliedInitial);
      if (!stateMatchesAppliedInitial) {
        const referenceSignature =
          previousAppliedInitial !== null
            ? computeSignature(previousAppliedInitial)
            : lastAppliedInitialSignatureRef.current;
        if (previousAppliedInitial !== null) {
          lastAppliedInitialSignatureRef.current = referenceSignature;
        }
        if (referenceSignature !== null) {
          const currentSignature = computeSignature(stateRef.current);
          if (
            currentSignature !== null &&
            currentSignature === referenceSignature
          ) {
            stateMatchesAppliedInitial = true;
          }
        }
      }
      if (
        pendingInitialResetKeyRef.current !== null ||
        stateMatchesAppliedInitial
      ) {
        pendingInitialResetKeyRef.current = key;
      }
    }

    const shouldUseInitial =
      pendingInitialResetKeyRef.current === key ||
      (!hasHydratedRef.current && pendingInitialResetKeyRef.current !== null);

    if (shouldUseInitial) {
      const nextInitial = initialRef.current;
      if (!Object.is(stateRef.current, nextInitial)) {
        setState(nextInitial);
        ignoreNextStorageHydrationRef.current = true;
      }
      lastAppliedInitialRef.current = nextInitial;
      lastAppliedInitialSignatureRef.current = computeSignature(nextInitial);
      pendingInitialResetKeyRef.current = null;
    }
  }, [initial, key, computeSignature]);

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) {
      const fullKey = fullKeyRef.current;
      let fallbackKey: string | null = null;
      let fromStorage = baseReadLocal<unknown>(fullKey);
      if (fromStorage === null) {
        const legacyKey = `${OLD_STORAGE_PREFIX}${key}`;
        const legacyValue = baseReadLocal<unknown>(legacyKey);
        if (legacyValue !== null) {
          fromStorage = legacyValue;
          fallbackKey = legacyKey;
        } else {
          const rawValue = baseReadLocal<unknown>(key);
          if (rawValue !== null) {
            fromStorage = rawValue;
            fallbackKey = key;
          }
        }
      }
      const queuedRevision = renderRevision;
      const stateChangedSinceQueue = () =>
        stateRevisionRef.current !== queuedRevision;

      let shouldUpdateState = false;
      let nextState: T = stateRef.current;

      const skipStorageHydration = ignoreNextStorageHydrationRef.current;
      ignoreNextStorageHydrationRef.current = false;
      if (skipStorageHydration) {
        // Intentionally skip applying storage to honor a freshly-applied initial state.
      } else if (fromStorage !== null) {
        const decoded = decodeValue(fromStorage);
        if (decoded !== null) {
          if (!Object.is(stateRef.current, decoded)) {
            shouldUpdateState = true;
            nextState = decoded;
            pendingInitialResetKeyRef.current = null;
          }
        } else if (!stateChangedSinceQueue()) {
          if (hasHydratedRef.current) {
            if (!Object.is(stateRef.current, initialRef.current)) {
              shouldUpdateState = true;
              nextState = initialRef.current;
              pendingInitialResetKeyRef.current = key;
            }
          }
        }
      } else if (!stateChangedSinceQueue()) {
        if (hasHydratedRef.current) {
          if (!Object.is(stateRef.current, initialRef.current)) {
            shouldUpdateState = true;
            nextState = initialRef.current;
            pendingInitialResetKeyRef.current = key;
          }
        }
      }

      hasHydratedRef.current = true;
      loadedRef.current = true;

      if (pendingPersistenceRef.current) {
        pendingPersistenceRef.current = false;
        try {
          const encoded = encodeValue(stateRef.current);
          scheduleWrite(fullKeyRef.current, encoded);
        } catch (error) {
          persistenceLogger.warn(
            `Failed to persist key "${fullKeyRef.current}" after hydration.`,
            error,
          );
        }
      }

      if (fallbackKey && fallbackKey !== fullKey) {
        try {
          window.localStorage.removeItem(fallbackKey);
        } catch (error) {
          persistenceLogger.warn(
            `Failed to remove legacy storage key "${fallbackKey}" during migration.`,
            error,
          );
        }
      }

      if (shouldUpdateState) {
        setState(nextState);
        const initialMatches =
          Object.is(nextState, initialRef.current) ||
          (() => {
            const nextSignature = computeSignature(nextState);
            if (nextSignature === null) return false;
            const initialSignature = computeSignature(initialRef.current);
            return (
              initialSignature !== null && nextSignature === initialSignature
            );
          })();
        if (initialMatches) {
          lastAppliedInitialRef.current = initialRef.current;
          lastAppliedInitialSignatureRef.current = computeSignature(
            initialRef.current,
          );
        } else {
          lastAppliedInitialRef.current = null;
          lastAppliedInitialSignatureRef.current = null;
        }
      }
    }
  }, [key, decodeValue, encodeValue, renderRevision, computeSignature]);

  const handleExternal = React.useCallback(
    (raw: string | null) => {
      if (!hasHydratedRef.current) return;
      if (raw === null) {
        pendingInitialResetKeyRef.current = key;
        if (!Object.is(stateRef.current, initialRef.current))
          setState(initialRef.current);
        lastAppliedInitialRef.current = initialRef.current;
        lastAppliedInitialSignatureRef.current = computeSignature(
          initialRef.current,
        );
        return;
      }
      const parsed = parseJSON<unknown>(raw);
      if (parsed === null) return;
      const decoded = decodeValue(parsed);
      if (decoded !== null) {
        pendingInitialResetKeyRef.current = null;
        if (!Object.is(stateRef.current, decoded)) setState(decoded);
        lastAppliedInitialRef.current = null;
        lastAppliedInitialSignatureRef.current = null;
        return;
      }
      pendingInitialResetKeyRef.current = key;
      if (!Object.is(stateRef.current, initialRef.current))
        setState(initialRef.current);
      lastAppliedInitialRef.current = initialRef.current;
      lastAppliedInitialSignatureRef.current = computeSignature(
        initialRef.current,
      );
    },
    [decodeValue, key, computeSignature],
  );

  useStorageSync(key, handleExternal);

  const setPersistentState = React.useCallback(
    (value: React.SetStateAction<T>) => {
      pendingInitialResetKeyRef.current = null;
      lastAppliedInitialRef.current = null;
      lastAppliedInitialSignatureRef.current = null;
      setState(value);
    },
    [setState],
  );

  React.useEffect(() => {
    if (!isBrowser) return;
    if (!loadedRef.current) {
      pendingPersistenceRef.current = true;
      return;
    }
    try {
      const encoded = encodeValue(state);
      scheduleWrite(fullKeyRef.current, encoded);
      pendingPersistenceRef.current = false;
    } catch (error) {
      persistenceLogger.warn(
        `Failed to persist key "${fullKeyRef.current}" after state update.`,
        error,
      );
    }
  }, [state, encodeValue]);

  return [state, setPersistentState];
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
