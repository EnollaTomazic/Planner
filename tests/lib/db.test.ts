import { describe, it, expect, vi } from "vitest";

describe("db beforeunload", () => {
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
});
