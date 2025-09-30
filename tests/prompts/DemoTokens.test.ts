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
    const spacingFromConfig = Object.entries(spacing)
      .filter(([key]) => /^\d+$/.test(key))
      .map(([, value]) => parseInt(String(value), 10));
    expect(spacingFromConfig).toEqual(spacingTokens);

    spacingTokens.forEach((_, index) => {
      const step = index + 1;
      expect(spacing[`space-${step}`]).toBe(`var(--space-${step})`);
    });

    const fractionalAliases: Record<string, string> = {
      "spacing-0-125": "var(--spacing-0-125)",
      "spacing-0-25": "var(--spacing-0-25)",
      "spacing-0-5": "var(--spacing-0-5)",
      "spacing-0-75": "var(--spacing-0-75)",
    };

    Object.entries(fractionalAliases).forEach(([token, variable]) => {
      expect(spacing[token]).toBe(variable);
    });

    const extendedAliases: Record<string, string> = {
      "space-9": "var(--space-9)",
      "space-10": "var(--space-10)",
      "space-11": "var(--space-11)",
      "space-12": "var(--space-12)",
      "space-16": "var(--space-16)",
    };

    Object.entries(extendedAliases).forEach(([token, variable]) => {
      expect(spacing[token]).toBe(variable);
    });
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
