import { describe, it, expect } from "vitest";
import type { Config } from "tailwindcss";
import config from "../../tailwind.config";
import { colorTokens, spacingTokens, radiusTokens } from "../../src/lib/tokens";

describe("demo tokens", () => {
  const tw = config as Config;

  it("match tailwind spacing config", () => {
    const spacing = (tw.theme?.extend?.spacing as Record<string, string>) ?? {};
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
    const colors = (tw.theme?.extend?.colors as Record<string, unknown>) ?? {};
    const collectColorKeys = (
      record: Record<string, unknown>,
      prefix = "",
    ): string[] =>
      Object.entries(record).flatMap(([name, value]) => {
        if (typeof value === "string") {
          const tokenName =
            name === "DEFAULT"
              ? prefix.replace(/-$/, "")
              : `${prefix}${name}`;
          return tokenName ? [tokenName] : [];
        }
        if (value && typeof value === "object") {
          return collectColorKeys(value as Record<string, unknown>, `${prefix}${name}-`);
        }
        return [];
      });

    const colorNames = collectColorKeys(colors)
      .map((name) => (name.endsWith("-DEFAULT") ? name.replace(/-DEFAULT$/, "") : name))
      .filter((name): name is string => Boolean(name));
    const expected = Array.from(new Set(colorNames)).map((name) => `bg-${name}`);
    expected.forEach((token) => expect(colorTokens).toContain(token));
  });
});
