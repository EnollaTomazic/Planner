import { describe, it, expect } from "vitest";
import config from "../../tailwind.config";
import { colorTokens, spacingTokens, radiusTokens } from "../../src/lib/tokens";

describe("demo tokens", () => {
  it("match tailwind spacing config", () => {
    const spacing = (config as any).theme?.extend?.spacing ?? {};
    const spacingFromConfig = Object.values(spacing).map((v) =>
      parseInt(String(v)),
    );
    expect(spacingTokens).toEqual(spacingFromConfig);
  });

  it("match tailwind radius config", () => {
    const radius = (config as any).theme?.extend?.borderRadius ?? {};
    const radiusFromConfig = Object.values(radius).map((v) => {
      const match = String(v).match(/var\(([^)]+)\)/);
      return match ? match[1] : v;
    });
    expect(radiusTokens).toEqual(radiusFromConfig);
  });

  it("use colors defined in tailwind config", () => {
    const colors = (config as any).theme?.extend?.colors ?? {};
    const expected = Object.keys(colors).map((name) => `bg-${name}`);
    expect(colorTokens.sort()).toEqual(expected.sort());
  });
});
