import React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NeonIcon } from "@/components/ui";
import { VARIANT_LABELS, type Variant } from "@/lib/theme";

type ThemeVariant = {
  readonly id: Variant;
  readonly label: string;
};

const DANGER_THEMES: readonly ThemeVariant[] = [
  { id: "lg", label: VARIANT_LABELS.lg },
  { id: "aurora", label: VARIANT_LABELS.aurora },
  { id: "kitten", label: VARIANT_LABELS.kitten },
  { id: "ocean", label: VARIANT_LABELS.ocean },
  { id: "citrus", label: VARIANT_LABELS.citrus },
  { id: "noir", label: VARIANT_LABELS.noir },
  { id: "hardstuck", label: VARIANT_LABELS.hardstuck },
] as const;

let stylesInjected = false;
let neonIconCss: string | null = null;
let globalsCss: string | null = null;
let icon2xlSize: string;

function sanitizeCss(value: string): string {
  return value
    .replace(/@tailwind[^;]+;/g, "")
    .replace(/@reference[^;]+;/g, "")
    .replace(/@import[^;]+;/g, "");
}

function injectThemeStyles() {
  if (stylesInjected) {
    return;
  }
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const rootDir = path.resolve(currentDir, "../..");
  const tokensCss = fs.readFileSync(path.join(rootDir, "tokens/tokens.css"), "utf8");
  const themesCssRaw = fs.readFileSync(path.join(rootDir, "src/app/themes.css"), "utf8");
  const globalsCssRaw = loadGlobalsCss();
  const themesCss = sanitizeCss(themesCssRaw);
  const normalizedGlobalsCss = sanitizeCss(globalsCssRaw);
  const style = document.createElement("style");
  style.textContent = `${tokensCss}\n${themesCss}\n${normalizedGlobalsCss}`;
  document.head.appendChild(style);
  stylesInjected = true;
}

function resolveColorExpression(value: string): string {
  const scratch = document.createElement("div");
  scratch.style.color = value;
  document.body.appendChild(scratch);
  const resolved = getComputedStyle(scratch).color;
  scratch.remove();
  return resolved;
}

function resolveLength(value: string): string {
  const scratch = document.createElement("div");
  scratch.style.width = value;
  document.body.appendChild(scratch);
  const { width } = getComputedStyle(scratch);
  scratch.remove();
  return width;
}

function resolveDangerColor(): { color: string; value: string } {
  const rootStyle = getComputedStyle(document.documentElement);
  const dangerValue = rootStyle.getPropertyValue("--danger").trim();
  if (!dangerValue) {
    throw new Error("Expected --danger token to be defined for the active theme");
  }
  const color = resolveColorExpression(`hsl(${dangerValue})`);
  return { color, value: dangerValue };
}

function loadNeonIconCss(): string {
  if (neonIconCss) {
    return neonIconCss;
  }
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const rootDir = path.resolve(currentDir, "../..");
  neonIconCss = fs.readFileSync(
    path.join(rootDir, "src/components/ui/toggles/NeonIcon.module.css"),
    "utf8",
  );
  return neonIconCss;
}

function loadGlobalsCss(): string {
  if (globalsCss) {
    return globalsCss;
  }
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const rootDir = path.resolve(currentDir, "../..");
  globalsCss = fs.readFileSync(path.join(rootDir, "src/app/globals.css"), "utf8");
  return globalsCss;
}

function applyTheme(variant: Variant) {
  const { classList } = document.documentElement;
  const toRemove: string[] = [];

  classList.forEach((className) => {
    if (className.startsWith("theme-")) {
      toRemove.push(className);
    }
  });

  if (toRemove.length > 0) {
    classList.remove(...toRemove);
  }

  if (variant !== "lg") {
    classList.add(`theme-${variant}`);
  }
}

const StubGlyph = ({ strokeWidth, ...rest }: React.SVGProps<SVGSVGElement>) => (
  <svg strokeWidth={strokeWidth} {...rest} />
);

afterEach(() => {
  applyTheme("lg");
});

beforeAll(() => {
  injectThemeStyles();
  icon2xlSize = resolveLength("var(--icon-size-2xl)");
});

describe("NeonIcon danger tone", () => {
  it("maps the danger tone to the danger token", () => {
    const css = loadNeonIconCss();
    expect(css).toMatch(/data-tone="danger"[^}]+--ni-color:\s*hsl\(var\(--danger\)\);/);
  });

  const baseDanger = resolveColorExpression("hsl(0 84% 60%)");

  for (const { id, label } of DANGER_THEMES) {
    it(`matches the ${label} danger palette`, () => {
      applyTheme(id);
      render(<NeonIcon icon={StubGlyph} on tone="danger" scanlines={false} aura={false} />);
      const { color: resolvedColor } = resolveDangerColor();
      expect(resolvedColor).toBe(baseDanger);
    });
  }
});

describe("NeonIcon size tokens", () => {
  it("maps the 2xl size to the icon token", () => {
    const css = loadNeonIconCss();
    expect(css).toMatch(/data-size="2xl"[^}]+--ni-size:\s*var\(--icon-size-2xl\);/);
  });

  for (const { id, label } of DANGER_THEMES) {
    it(`keeps the ${label} 2xl footprint`, () => {
      applyTheme(id);
      const { container } = render(
        <NeonIcon icon={StubGlyph} on tone="accent" size="2xl" scanlines={false} aura={false} />,
      );
      const root = container.firstElementChild as HTMLElement | null;
      expect(root).not.toBeNull();
      const computed = getComputedStyle(root!);
      expect(computed.width).toBe(icon2xlSize);
      expect(computed.height).toBe(icon2xlSize);
    });
  }
});
