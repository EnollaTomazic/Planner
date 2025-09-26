import { describe, expect, it } from "vitest";

import { resolveTokenColor, tokenToHexColor } from "@/lib/color";

describe("color token helpers", () => {
  it("converts raw HSL tokens to hex", () => {
    expect(tokenToHexColor("247 34% 6%")).toBe("#0b0a15");
    expect(tokenToHexColor("258 26% 97%")).toBe("#f7f5f9");
    expect(tokenToHexColor("250 96% 78%")).toBe("#a391fd");
  });

  it("passes through derived tokens", () => {
    expect(tokenToHexColor("var(--accent)")).toBe("var(--accent)");
    expect(resolveTokenColor("var(--accent)"))
      .toBe("var(--accent)");
  });

  it("resolves mixed token inputs", () => {
    expect(resolveTokenColor("#ffffff")).toBe("#ffffff");
    expect(resolveTokenColor("247 34% 6%"))
      .toBe("#0b0a15");
  });
});
