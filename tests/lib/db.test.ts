import { describe, it, expect, vi } from "vitest";

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
  it("generates unique ids without crypto.randomUUID", async () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });
    const { uid } = await import("@/lib/db");
    const ids = new Set<string>();
    for (let i = 0; i < 10000; i++) ids.add(uid());
    expect(ids.size).toBe(10000);
    Object.defineProperty(globalThis, "crypto", {
      value: original,
      configurable: true,
    });
  });
});
