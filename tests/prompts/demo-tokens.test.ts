import { describe, it, expect } from "vitest";
import type { Config } from "tailwindcss";
import config from "../../tailwind.config";
import { colorTokens, spacingTokens, radiusTokens } from "../../src/lib/tokens";

describe("demo tokens", () => {
  const tw = config as Config;

  it("match tailwind spacing config", () => {
    const spacing =
      (tw.theme?.extend?.spacing as Record<string, string>) ?? {};
    const spacingFromConfig = Object.values(spacing).map((v) =>
      parseInt(String(v)),
    );
    expect(spacingTokens).toEqual(spacingFromConfig);
  });

  it("match tailwind radius config", () => {
    const radius =
      (tw.theme?.extend?.borderRadius as Record<string, string>) ?? {};
    const radiusFromConfig = Object.values(radius).map((v) => {
      const match = String(v).match(/var\(([^)]+)\)/);
      return match ? match[1] : v;
    });
    expect(radiusTokens).toEqual(radiusFromConfig);
  });

  it("use colors defined in tailwind config", () => {
    const colors =
      (tw.theme?.extend?.colors as Record<string, unknown>) ?? {};
    const expected = Object.keys(colors).map((name) => `bg-${name}`);
    expect(colorTokens.sort()).toEqual(expected.sort());
  });
});
