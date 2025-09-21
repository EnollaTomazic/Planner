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

      expect(createStorageKey("legacy")).toBe("noxis-planner:legacy");
      expect(window.localStorage.getItem("noxis-planner:legacy")).toBe("value");
      expect(window.localStorage.getItem("13lr:legacy")).toBeNull();
      const calls = keySpy.mock.calls.length;

      createStorageKey("another");
      expect(keySpy.mock.calls.length).toBe(calls);

      Object.defineProperty(window, "localStorage", { value: original });
    });
  });
});
