import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const originalLocalStorage = window.localStorage;

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
    storage: storage as Storage,
    store,
    getItem,
    setItem,
    removeItem,
    clear,
    key,
  };
}

type StorageMock = ReturnType<typeof createMockStorage>;

describe("write queue scheduling", () => {
  let mock: StorageMock;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound;
    mock = createMockStorage();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: mock.storage,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("defers writes until the debounce delay elapses", async () => {
    const { scheduleWrite } = await import("@/lib/db");

    scheduleWrite("debounce-key", { count: 1 });

    expect(mock.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(49);
    expect(mock.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(mock.setItem).toHaveBeenCalledTimes(1);
    expect(mock.setItem).toHaveBeenLastCalledWith(
      "debounce-key",
      JSON.stringify({ count: 1 }),
    );
  });

  it("flushes queued writes immediately when requested", async () => {
    const { scheduleWrite, flushWriteLocal } = await import("@/lib/db");

    scheduleWrite("first", { id: 1 });
    scheduleWrite("second", { id: 2 });

    expect(mock.setItem).not.toHaveBeenCalled();

    flushWriteLocal();

    expect(mock.setItem).toHaveBeenCalledTimes(2);
    expect(mock.store.get("first")).toBe(JSON.stringify({ id: 1 }));
    expect(mock.store.get("second")).toBe(JSON.stringify({ id: 2 }));

    vi.advanceTimersByTime(100);
    expect(mock.setItem).toHaveBeenCalledTimes(2);
  });

  it("syncs storage updates across listeners", async () => {
    const { useStorageSync, createStorageKey } = await import("@/lib/db");
    const onChange = vi.fn();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });

    const { unmount } = renderHook(() => useStorageSync("sync-key", onChange));
    const fullKey = createStorageKey("sync-key");
    const otherArea = window.sessionStorage ?? originalLocalStorage;

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: fullKey,
          newValue: JSON.stringify({ tab: 1 }),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(JSON.stringify({ tab: 1 }));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other-key",
          newValue: JSON.stringify({ tab: 2 }),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: fullKey,
          newValue: JSON.stringify({ tab: 3 }),
          storageArea: otherArea,
        }),
      );
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: fullKey,
          newValue: JSON.stringify({ tab: 4 }),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("db event bindings", () => {
  it("attaches listener only once", async () => {
    const spy = vi.spyOn(window, "addEventListener");
    await import("@/lib/db");
    expect(spy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    spy.mockClear();
    vi.resetModules();
    await import("@/lib/db");
    expect(spy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));
    spy.mockRestore();
  });

  it("flushes queued writes when page becomes hidden", async () => {
    vi.resetModules();
    delete (window as any).__planner_flush_bound;
    const bootstrap = await import("@/lib/local-bootstrap");
    const spy = vi.spyOn(bootstrap, "writeLocal");
    const { writeLocal } = await import("@/lib/db");
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    writeLocal("test", "value");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });
});

describe("writeLocal", () => {
  it("removes key when value is undefined or null", async () => {
    window.localStorage.setItem("a", "1");
    window.localStorage.setItem("b", "2");
    const mod = await import("@/lib/local-bootstrap");
    mod.writeLocal("a", undefined);
    mod.writeLocal("b", null);
    expect(window.localStorage.getItem("a")).toBeNull();
    expect(window.localStorage.getItem("b")).toBeNull();
  });
});

describe("uid", () => {
  it("generates unique ids using crypto.getRandomValues when randomUUID is unavailable", async () => {
    vi.resetModules();
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    const getRandomValues = vi.fn<Crypto["getRandomValues"]>((buffer: ArrayBufferView | null) => {
      if (buffer === null) throw new TypeError("Expected buffer");
      const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      for (let i = 0; i < view.length; i++) {
        view[i] = (i * 17 + 11) & 0xff;
      }
      return buffer;
    });
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: { getRandomValues } as unknown as Crypto,
    });
    const { uid } = await import("@/lib/db");
    const ids = new Set<string>();
    for (let i = 0; i < 10000; i++) ids.add(uid());
    expect(ids.size).toBe(10000);
    expect(getRandomValues).toHaveBeenCalled();
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalDescriptor);
    } else {
      Reflect.deleteProperty(globalThis as Record<string, unknown>, "crypto");
    }
  });
});
