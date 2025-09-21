import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistentState, createStorageKey } from "@/lib/db";

describe("UsePersistentState", () => {
  it("ignores unchanged storage values", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return usePersistentState("ps-key", 1);
    });
    act(() => {
      const e = new StorageEvent("storage", {
        key: createStorageKey("ps-key"),
        newValue: "1",
        storageArea: window.localStorage,
      });
      window.dispatchEvent(e);
    });
    expect(renders).toBe(1);
    act(() => {
      const e = new StorageEvent("storage", {
        key: createStorageKey("ps-key"),
        newValue: "2",
        storageArea: window.localStorage,
      });
      window.dispatchEvent(e);
    });
    expect(result.current[0]).toBe(2);
    expect(renders).toBe(2);
  });
});
