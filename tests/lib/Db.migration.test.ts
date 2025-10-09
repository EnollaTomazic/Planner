import { describe, it, expect, vi } from "vitest";

// Ensure legacy key migration runs only once


describe("DbMigration", () => {
  describe("ensureMigration", () => {
    it("migrates legacy keys only once", async () => {
      vi.resetModules();
      const original = window.localStorage;
      const store: Record<string, string> = { "13lr:legacy": "value" };
      const mockStorage: Storage = {
        getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const k of Object.keys(store)) delete store[k];
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
          return Object.keys(store).length;
        },
      } as unknown as Storage;

      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        configurable: true,
      });

      const { createStorageKey } = await import("@/lib/db");
      const keySpy = vi.spyOn(window.localStorage, "key");

      const versionedKey = createStorageKey("legacy");
      expect(versionedKey).toBe("noxis-planner:v1:legacy");
      expect(window.localStorage.getItem(versionedKey)).toBe("value");
      expect(window.localStorage.getItem("13lr:legacy")).toBeNull();
      const calls = keySpy.mock.calls.length;

      createStorageKey("another");
      expect(keySpy.mock.calls.length).toBe(calls);

      Object.defineProperty(window, "localStorage", { value: original });
    });

    it("drops mismatched storage versions while migrating data", async () => {
      vi.resetModules();
      const original = window.localStorage;
      const store: Record<string, string> = {
        "noxis-planner:v0:test": "legacy",
        "noxis-planner:test": "value",
        "noxis-planner:v2:test": "future",
      };

      const mockStorage: Storage = {
        getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const k of Object.keys(store)) delete store[k];
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
          return Object.keys(store).length;
        },
      } as unknown as Storage;

      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        configurable: true,
      });

      const { createStorageKey } = await import("@/lib/db");
      const migratedKey = createStorageKey("test");

      expect(migratedKey).toBe("noxis-planner:v1:test");
      expect(window.localStorage.getItem(migratedKey)).toBe("value");
      expect(window.localStorage.getItem("noxis-planner:test")).toBeNull();
      expect(window.localStorage.getItem("noxis-planner:v0:test")).toBeNull();
      expect(window.localStorage.getItem("noxis-planner:v2:test")).toBeNull();

      Object.defineProperty(window, "localStorage", { value: original });
    });
  });
});
