import { describe, it, expect } from "vitest";
import type { Config } from "tailwindcss";
import config from "../../tailwind.config";
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  radiusScale,
} from "../../src/lib/tokens";

const flattenColorTokens = (
  value: Record<string, unknown>,
  path: string[] = [],
): string[] => {
  return Object.entries(value).flatMap(([key, entry]) => {
    if (typeof entry === "string") {
      const segments = [...path];
      if (key !== "DEFAULT") {
        segments.push(key);
      }
      const token = segments.join("-");
      return [`bg-${token}`];
    }
    if (entry && typeof entry === "object") {
      return flattenColorTokens(entry as Record<string, unknown>, [...path, key]);
    }
    return [];
  });
};

describe("DemoTokens", () => {
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
    const expectedRadius = Object.entries(radiusScale).reduce<
      Record<string, string>
    >((acc, [name, value]) => {
      acc[name] = `${value}px`;
      return acc;
    }, {});
    expect(radius).toEqual(expectedRadius);

    const configRadiusTokens = Object.keys(radius).map(
      (name) => `--radius-${name}`,
    );
    expect(radiusTokens).toEqual(configRadiusTokens);
  });

  it("use colors defined in tailwind config", () => {
    const colors = (tw.theme?.extend?.colors as Record<string, unknown>) ?? {};
    const expected = flattenColorTokens(colors);
    expected.forEach((token) => expect(colorTokens).toContain(token));
  });
});
