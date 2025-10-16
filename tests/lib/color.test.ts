import { describe, expect, it } from "vitest";

import { resolveTokenColor, tokenToHexColor } from "@/lib/color";

const RGB_COMPONENT_PATTERN = /\d+/g;
const HSL_FUNCTION = "hsl";
const OPEN_PAREN = "(";
const CLOSE_PAREN = ")";

const toHex = (components: readonly number[]): string =>
  `#${components
    .map((component) => Math.round(component).toString(16).padStart(2, "0"))
    .join("")}`;

const resolveCssColorToHex = (cssColor: string): string => {
  const matches = cssColor.match(RGB_COMPONENT_PATTERN);
  if (!matches || matches.length < 3) {
    return cssColor;
  }
  const [red, green, blue] = matches.slice(0, 3).map((value) => Number.parseInt(value, 10));
  return toHex([red, green, blue]);
};

const resolveHslTokenToHex = (token: string): string => {
  const scratch = document.createElement("div");
  scratch.style.color = `${HSL_FUNCTION}${OPEN_PAREN}${token}${CLOSE_PAREN}`;
  document.body.appendChild(scratch);
  const resolved = getComputedStyle(scratch).color;
  scratch.remove();
  return resolveCssColorToHex(resolved);
};

describe("color token helpers", () => {
  it("converts raw HSL tokens to hex", () => {
    expect(tokenToHexColor("247 34% 6%")).toBe(resolveHslTokenToHex("247 34% 6%"));
    expect(tokenToHexColor("258 26% 97%")).toBe(resolveHslTokenToHex("258 26% 97%"));
    expect(tokenToHexColor("250 96% 78%")).toBe(resolveHslTokenToHex("250 96% 78%"));
  });

  it("passes through derived tokens", () => {
    expect(tokenToHexColor("var(--accent)")).toBe("var(--accent)");
    expect(resolveTokenColor("var(--accent)"))
      .toBe("var(--accent)");
  });

  it("resolves mixed token inputs", () => {
    const whiteHex = toHex([255, 255, 255]);
    expect(resolveTokenColor(whiteHex)).toBe(whiteHex);
    const backgroundHex = resolveHslTokenToHex("247 34% 6%");
    expect(resolveTokenColor("247 34% 6%"))
      .toBe(backgroundHex);
  });
});
