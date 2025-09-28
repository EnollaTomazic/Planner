import tokens from "../../tokens/tokens.js";
import { tokensToFilter } from "@/lib/filter-tokens";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("tokensToFilter", () => {
  const getDefaultSlope = () => {
    const parsed = Number.parseFloat(tokens.gradientNoiseOpacity);
    return Number.isFinite(parsed) ? parsed : 0.1;
  };

  const mockComputedStyle = (values: Record<string, string>) => {
    vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({
      getPropertyValue: (property: string) => values[property] ?? "",
    }) as unknown as CSSStyleDeclaration);
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns numeric values from the current theme tokens", () => {
    mockComputedStyle({
      "--gradient-noise-opacity": "0.45",
      "--gradient-noise-table": "0 0.25 0.75 1",
      "--gradient-noise-std-deviation": "2.5",
    });

    const result = tokensToFilter();

    expect(result.slope).toBeCloseTo(0.45);
    expect(result.table).toEqual([0, 0.25, 0.75, 1]);
    expect(result.stdDeviation).toBeCloseTo(2.5);
  });

  it("clamps values outside the supported range", () => {
    mockComputedStyle({
      "--gradient-noise-opacity": "-0.5",
      "--gradient-noise-table": "-1 0.5 3",
      "--gradient-noise-std-deviation": "96",
    });

    const result = tokensToFilter();

    expect(result.slope).toBe(0);
    expect(result.table).toEqual([0, 0.5, 1]);
    expect(result.stdDeviation).toBe(64);
  });

  it("falls back to the defaults when the tokens are missing or invalid", () => {
    mockComputedStyle({
      "--gradient-noise-opacity": "var(--missing, )",
      "--gradient-noise-table": "inherit",
      "--gradient-noise-std-deviation": "",
    });

    const result = tokensToFilter();

    expect(result.slope).toBeCloseTo(getDefaultSlope());
    expect(result.table).toEqual([0, 1]);
    expect(result.stdDeviation).toBe(0);
  });
});
