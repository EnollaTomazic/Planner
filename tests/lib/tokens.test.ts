import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readNumberToken } from "@/lib/tokens";

describe("readNumberToken", () => {
  const originalGetComputedStyle = global.getComputedStyle;
  const properties = new Map<string, string>();

  beforeEach(() => {
    properties.clear();
    properties.set("--direct", "12px");
    properties.set("--alias", "var(--direct)");
    properties.set("--duration", "var(--duration-base)");
    properties.set("--duration-base", "220ms");
    properties.set("--length", "var(--length-source)");
    properties.set("--length-source", "64px");
    properties.set("--calc", "calc(var(--length) * 3.5)");
    properties.set("--nested-calc", "calc(var(--length) + calc(var(--small) * 2))");
    properties.set("--small", "12px");
    properties.set("--with-fallback", "var(--missing, 18px)");
    properties.set("--calc-fallback", "calc(var(--missing-length, 10px) * 2)");

    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: (name: string) => properties.get(name) ?? "",
    })) as unknown as typeof getComputedStyle;
  });

  afterEach(() => {
    global.getComputedStyle = originalGetComputedStyle;
  });

  it("parses direct numeric tokens", () => {
    expect(readNumberToken("--direct", 0)).toBe(12);
  });

  it("resolves chained var references", () => {
    expect(readNumberToken("--duration", 0)).toBe(220);
  });

  it("evaluates calc expressions with variable references", () => {
    expect(readNumberToken("--calc", 0)).toBeCloseTo(224);
  });

  it("uses fallback values when references are missing", () => {
    expect(readNumberToken("--with-fallback", 0)).toBe(18);
  });

  it("handles nested calc expressions and fallbacks", () => {
    expect(readNumberToken("--calc-fallback", 0)).toBe(20);
    expect(readNumberToken("--nested-calc", 0)).toBeCloseTo(88);
  });
});
