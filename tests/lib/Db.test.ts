import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalLocalStorage = window.localStorage;
const originalStorageEvent = window.StorageEvent;

type StorageMock = ReturnType<typeof createMockStorage>;

function createMockStorage() {
  const store = new Map<string, string>();

  const getItem = vi.fn((key: string) => (store.has(key) ? store.get(key)! : null));
  const setItem = vi.fn((key: string, value: string) => {
    store.set(key, value);
  });
  const removeItem = vi.fn((key: string) => {
    store.delete(key);
  });
  const clear = vi.fn(() => {
    store.clear();
  });
  const key = vi.fn((index: number) => Array.from(store.keys())[index] ?? null);

  const storage = {
    getItem,
    setItem,
    removeItem,
    clear,
    key,
  } as Record<string, unknown>;

  Object.defineProperty(storage, "length", {
    configurable: true,
    get: () => store.size,
  });

  return {
    store,
    storage: storage as Storage,
    getItem,
    setItem,
    removeItem,
    clear,
    key,
  };
}

class MockStorageEvent extends Event {
  readonly key: string | null;
  readonly newValue: string | null;
  readonly oldValue: string | null;
  readonly storageArea: Storage | null;
  readonly url: string;

  constructor(type: string, init: StorageEventInit = {}) {
    super(type, init);
    this.key = init.key ?? null;
    this.newValue = init.newValue ?? null;
    this.oldValue = init.oldValue ?? null;
    this.storageArea = init.storageArea ?? null;
    this.url = init.url ?? "";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initStorageEvent(
    _type?: string,
    _bubbles?: boolean,
    _cancelable?: boolean,
    _key?: string | null,
    _oldValue?: string | null,
    _newValue?: string | null,
    _url?: string | null,
    _storageArea?: Storage | null,
  ) {}
}

function dispatchStorageEvent(init: StorageEventInit & { key?: string | null }) {
  const event = new StorageEvent("storage", init);
  window.dispatchEvent(event);
  return event;
}

let storageMock: StorageMock;

beforeEach(() => {
  vi.resetModules();
  storageMock = createMockStorage();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storageMock.storage,
  });

  vi.stubGlobal("StorageEvent", MockStorageEvent as unknown as typeof StorageEvent);
  delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound;
});

afterEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
  });

  vi.unstubAllGlobals();
  if (originalStorageEvent) {
    Object.defineProperty(window, "StorageEvent", {
      configurable: true,
      value: originalStorageEvent,
    });
  }

  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.resetModules();
  delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound;
});


describe("Db", () => {
  describe("setWriteLocalDelay", () => {
    it("clamps negative delays to zero", async () => {
      const db = await import("@/lib/db");

      db.setWriteLocalDelay(-10);

      expect(db.writeLocalDelay).toBe(0);
    });

    it("keeps positive delays unchanged", async () => {
      const db = await import("@/lib/db");

      db.setWriteLocalDelay(75);

      expect(db.writeLocalDelay).toBe(75);
    });
  });

  describe("scheduleWrite", () => {
    it("debounces writes until the delay elapses", async () => {
      vi.useFakeTimers();
      const { scheduleWrite } = await import("@/lib/db");
      const key = "noxis-planner:debounce";

      scheduleWrite(key, { count: 1 });

      expect(storageMock.setItem).not.toHaveBeenCalled();

      vi.advanceTimersByTime(49);
      expect(storageMock.setItem).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(storageMock.setItem).toHaveBeenCalledTimes(1);
      expect(storageMock.setItem).toHaveBeenLastCalledWith(
        key,
        JSON.stringify({ count: 1 }),
      );
    });

    it("flushes queued writes immediately when requested", async () => {
      vi.useFakeTimers();
      const { scheduleWrite, flushWriteLocal } = await import("@/lib/db");

      const firstKey = "noxis-planner:first";
      const secondKey = "noxis-planner:second";

      scheduleWrite(firstKey, { id: 1 });
      scheduleWrite(secondKey, { id: 2 });

      expect(storageMock.setItem).not.toHaveBeenCalled();

      flushWriteLocal();

      expect(storageMock.setItem).toHaveBeenCalledTimes(2);
      expect(storageMock.store.get(firstKey)).toBe(JSON.stringify({ id: 1 }));
      expect(storageMock.store.get(secondKey)).toBe(JSON.stringify({ id: 2 }));

      vi.advanceTimersByTime(100);
      expect(storageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it("skips persistence when cloning fails", async () => {
      const stringifySpy = vi
        .spyOn(JSON, "stringify")
        .mockImplementation(() => {
          throw new Error("nope");
        });
      const structuredCloneSpy = vi
        .spyOn(globalThis, "structuredClone")
        .mockImplementation(() => {
          throw new Error("still nope");
        });
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { scheduleWrite, flushWriteLocal } = await import("@/lib/db");

      const key = "noxis-planner:clone-fail";
      const value = { id: 42 };

      scheduleWrite(key, value);

      expect(stringifySpy).toHaveBeenCalledTimes(1);
      expect(structuredCloneSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        `[planner:persistence] Skipping persistence for "${key}" because value could not be cloned.`,
        value,
      );

      flushWriteLocal();
      expect(storageMock.setItem).not.toHaveBeenCalled();

      stringifySpy.mockRestore();
      structuredCloneSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it("warns about circular references during development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        const { scheduleWrite, flushWriteLocal } = await import("@/lib/db");

        const key = "noxis-planner:circular";
        const value: Record<string, unknown> = {};
        value.self = value;

        scheduleWrite(key, value);

        expect(warnSpy).toHaveBeenCalledWith(
          `[planner:persistence] Skipping persistence for "${key}" because value.self contains a circular reference.`,
          value,
        );

        flushWriteLocal();
        expect(storageMock.setItem).not.toHaveBeenCalled();
      } finally {
        vi.unstubAllEnvs();
        warnSpy.mockRestore();
      }
    });

    it("encodes typed arrays using binary payloads", async () => {
      const { scheduleWrite, flushWriteLocal } = await import("@/lib/db");

      const key = "noxis-planner:binary";
      const payload = { bytes: new Uint8Array([5, 10, 15]) };

      scheduleWrite(key, payload);
      flushWriteLocal();

      expect(storageMock.store.get(key)).toMatch(/__planner_binary__/);
    });
  });

  describe("readLocal", () => {
    it("loads legacy 13lr-prefixed data when migration fails", async () => {
      const originalSetItem = storageMock.setItem.getMockImplementation();
      expect(originalSetItem).toBeTypeOf("function");

      storageMock.store.set("13lr:legacy", JSON.stringify({ ready: true }));

      storageMock.setItem.mockImplementation((key: string, value: string) => {
        if (key.startsWith("noxis-planner:")) {
          throw new Error("migration unavailable");
        }
        return (originalSetItem as (key: string, value: string) => void)(
          key,
          value,
        );
      });

      const { readLocal } = await import("@/lib/db");

      expect(readLocal<{ ready: boolean }>("legacy")).toEqual({ ready: true });
      expect(storageMock.store.has("noxis-planner:legacy")).toBe(false);

      storageMock.setItem.mockImplementation(
        originalSetItem as (key: string, value: string) => void,
      );
    });
  });

  describe("removeLocal", () => {
    it("removes legacy-only entries when migration fails", async () => {
      const { OLD_STORAGE_PREFIX } = await import("@/lib/storage-key");
      const legacyKey = "legacy-only";
      const legacyPrefixedKey = `${OLD_STORAGE_PREFIX}${legacyKey}`;

      storageMock.store.set(legacyPrefixedKey, JSON.stringify({ stored: true }));

      const lengthDescriptor = Object.getOwnPropertyDescriptor(
        window.localStorage,
        "length",
      );

      Object.defineProperty(window.localStorage, "length", {
        configurable: true,
        get: () => {
          throw new Error("length unavailable");
        },
      });

      try {
        const { removeLocal } = await import("@/lib/db");

        removeLocal(legacyKey);

        expect(storageMock.removeItem).toHaveBeenCalledWith(legacyPrefixedKey);
        expect(storageMock.store.has(legacyPrefixedKey)).toBe(false);
      } finally {
        if (lengthDescriptor) {
          Object.defineProperty(window.localStorage, "length", lengthDescriptor);
        }
      }
    });
  });

  describe("writeLocal", () => {
    it("serializes objects once and ignores subsequent mutations", async () => {
      vi.useFakeTimers();

      const key = "mutations";
      const value = { count: 1, nested: { done: false } };
      const expectedSerialized = JSON.stringify(value);
      const stringifySpy = vi.spyOn(JSON, "stringify");

      const { writeLocal, flushWriteLocal, createStorageKey } = await import(
        "@/lib/db"
      );

      writeLocal(key, value);
      value.count = 9;
      value.nested.done = true;

      expect(storageMock.setItem).not.toHaveBeenCalled();

      vi.runAllTimers();
      flushWriteLocal();

      const fullKey = createStorageKey(key);
      expect(storageMock.setItem).toHaveBeenCalledWith(
        fullKey,
        expectedSerialized,
      );
      expect(storageMock.store.get(fullKey)).toBe(expectedSerialized);
      expect(stringifySpy).toHaveBeenCalledTimes(1);

      stringifySpy.mockRestore();
    });
  });

  describe("useStorageSync", () => {
    it("notifies listeners only for matching localStorage changes", async () => {
      const { useStorageSync, createStorageKey } = await import("@/lib/db");
      const onChange = vi.fn();

      const { unmount } = renderHook(() => useStorageSync("sync-key", onChange));
      const fullKey = createStorageKey("sync-key");
      const otherArea = createMockStorage().storage;

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ tab: 1 }),
          storageArea: window.localStorage,
        });
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(JSON.stringify({ tab: 1 }));

      act(() => {
        dispatchStorageEvent({
          key: "other-key",
          newValue: JSON.stringify({ tab: 2 }),
          storageArea: window.localStorage,
        });
      });

      expect(onChange).toHaveBeenCalledTimes(1);

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ tab: 3 }),
          storageArea: otherArea,
        });
      });

      expect(onChange).toHaveBeenCalledTimes(1);

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ tab: 4 }),
          storageArea: window.localStorage,
        });
      });

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith(JSON.stringify({ tab: 4 }));

      unmount();
    });
  });

  describe("usePersistentState", () => {
    it("hydrates from storage after mount and stays in sync", async () => {
      const { usePersistentState, createStorageKey, flushWriteLocal } = await import("@/lib/db");

      const key = "preferences";
      const fullKey = createStorageKey(key);
      const initialState = { theme: "light" };
      const storedState = { theme: "dark" };

      window.localStorage.setItem(fullKey, JSON.stringify(storedState));

      const renders: Array<typeof initialState> = [];
      const { result } = renderHook(() => {
        const hookResult = usePersistentState(key, initialState);
        renders.push(hookResult[0]);
        return hookResult;
      });

      expect(renders[0]).toEqual(initialState);

      await waitFor(() => {
        expect(result.current[0]).toEqual(storedState);
      });

      act(() => {
        result.current[1]({ theme: "system" });
      });

      expect(storageMock.setItem).not.toHaveBeenCalledWith(
        fullKey,
        JSON.stringify({ theme: "system" }),
      );

      flushWriteLocal();

      expect(storageMock.setItem).toHaveBeenCalledWith(
        fullKey,
        JSON.stringify({ theme: "system" }),
      );
      expect(window.localStorage.getItem(fullKey)).toBe(
        JSON.stringify({ theme: "system" }),
      );

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ theme: "contrast" }),
          storageArea: window.localStorage,
        });
      });

      expect(result.current[0]).toEqual({ theme: "contrast" });

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: null,
          storageArea: window.localStorage,
        });
      });

      expect(result.current[0]).toEqual(initialState);
    });

    it("hydrates legacy unprefixed values and migrates them", async () => {
      const { usePersistentState, createStorageKey, flushWriteLocal } = await import("@/lib/db");

      const key = "animation-toggle";
      const fullKey = createStorageKey(key);

      window.localStorage.setItem(key, JSON.stringify(true));

      const { result } = renderHook(() => usePersistentState<boolean>(key, false));

      await waitFor(() => {
        expect(result.current[0]).toBe(true);
      });

      expect(storageMock.removeItem).toHaveBeenCalledWith(key);

      await waitFor(() => {
        expect(window.localStorage.getItem(key)).toBeNull();
      });

      flushWriteLocal();

      expect(window.localStorage.getItem(fullKey)).toBe(JSON.stringify(true));
    });

    it("applies decode and encode callbacks when provided", async () => {
      const {
        usePersistentState,
        createStorageKey,
        flushWriteLocal,
      } = await import("@/lib/db");

      const key = "encoded";
      const fullKey = createStorageKey(key);

      window.localStorage.setItem(
        fullKey,
        JSON.stringify({ value: "3" }),
      );

      const decode = vi.fn((raw: unknown) => {
        if (!raw || typeof raw !== "object") return null;
        const value = (raw as { value?: unknown }).value;
        return typeof value === "string" ? Number.parseInt(value, 10) : null;
      });
      const encode = vi.fn((value: number) => ({ value: String(value) }));

      const { result } = renderHook(() =>
        usePersistentState<number>(key, 0, { decode, encode }),
      );

      await waitFor(() => {
        expect(result.current[0]).toBe(3);
      });
      expect(decode).toHaveBeenCalledWith({ value: "3" });

      act(() => {
        result.current[1](7);
      });

      flushWriteLocal();

      expect(encode).toHaveBeenCalledWith(7);
      expect(window.localStorage.getItem(fullKey)).toBe(
        JSON.stringify({ value: "7" }),
      );

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ value: "11" }),
          storageArea: window.localStorage,
        });
      });

      await waitFor(() => {
        expect(result.current[0]).toBe(11);
      });

      act(() => {
        dispatchStorageEvent({
          key: fullKey,
          newValue: JSON.stringify({ wrong: true }),
          storageArea: window.localStorage,
        });
      });

      expect(result.current[0]).toBe(0);
    });
  });
});
