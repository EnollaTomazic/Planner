import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  Button,
  type ButtonSize,
} from "../../src/components/ui/primitives/Button";
import fs from "fs";
import DepthThemeProvider from "../../src/lib/depth-theme-context";
import styles from "../../src/components/ui/primitives/Button.module.css";

afterEach(cleanup);

describe("Button", () => {
  it("renders its children", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies variant classes", () => {
    const { getByRole } = render(
      <Button className="btn-primary">Click me</Button>,
    );
    expect(getByRole("button")).toHaveClass("btn-primary");
  });

  it("keeps child button type when rendered asChild", () => {
    const { getByRole } = render(
      <Button asChild>
        <button type="submit">Submit</button>
      </Button>,
    );

    expect(getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(<Button>Focus</Button>);
    const btn = getByRole("button");
    btn.focus();
    const style = getComputedStyle(btn);
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(
      true,
    );
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(
      true,
    );
  });

  it("has reduced opacity and no pointer events when disabled", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "disabled:opacity-disabled",
      "disabled:pointer-events-none",
    );
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each<[ButtonSize, string]>([
    ["sm", "[&_svg]:size-[var(--space-4)]"],
    ["md", "[&_svg]:size-[var(--space-5)]"],
    ["lg", "[&_svg]:size-[var(--space-8)]"],
    ["xl", "[&_svg]:size-[calc(var(--control-h-xl)*4/3)]"],
  ])("applies %s icon sizing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <svg />
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it.each<[ButtonSize, string]>([
    ["sm", "[&_svg]:size-[var(--space-4)]"],
    ["md", "[&_svg]:size-[var(--space-5)]"],
    ["lg", "[&_svg]:size-[var(--space-8)]"],
    ["xl", "[&_svg]:size-[calc(var(--control-h-xl)*4/3)]"],
  ])("applies %s icon sizing for wrapped icons", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <span>
          <svg />
        </span>
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it.each<[ButtonSize, string]>([
    ["sm", "gap-[var(--space-1)]"],
    ["md", "gap-[var(--space-2)]"],
    ["lg", "gap-[var(--space-4)]"],
    ["xl", "gap-[calc(var(--control-h-xl)/3)]"],
  ])("applies %s gap spacing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <svg />
        Label
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it("avoids disallowed px spacing", () => {
    const content = fs.readFileSync(
      "src/components/ui/primitives/Button.tsx",
      "utf8",
    );
    expect(content).not.toMatch(/\bpx-(5|6)\b/);
  });

  it("passes data-glitch through", () => {
    const { getByRole } = render(
      <Button glitch>
        Glitched
      </Button>,
    );

    expect(getByRole("button")).toHaveAttribute("data-glitch", "true");
  });

  it("references glitch overlay tokens", () => {
    const source = fs.readFileSync(
      "src/components/ui/primitives/BlobContainer.tsx",
      "utf8",
    );

    expect(source).toContain("glitch-overlay-button-opacity");
    expect(source).toContain("glitch-noise-level");
  });

  it("captures the neumorphic depth token bundle", () => {
    const neuModule = fs.readFileSync(
      "src/components/ui/neumorphic.module.css",
      "utf8",
    );

    expect(neuModule).toContain("--depth-shadow-outer");
    expect(neuModule).toContain("--depth-shadow-inner");
    expect(neuModule).toContain("--depth-shadow-outer-strong");

    const buttonSource = fs.readFileSync(
      "src/components/ui/primitives/Button.tsx",
      "utf8",
    );

    expect(buttonSource).toContain("data-tactile");
    expect(buttonSource).toContain("[--neu-surface:hsl(var(--panel)/0.8)]");
  });

  it("defines button glitch overlay tokens in theme bundle", () => {
    const themeCss = fs.readFileSync("src/app/themes.css", "utf8");

    expect(themeCss).toContain("--glitch-overlay-button-opacity:");
    expect(themeCss).toContain("--glitch-overlay-button-opacity-reduced:");
  });

  it("warns and renders nothing when asChild is missing a valid child", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    let renderResult: ReturnType<typeof render> | undefined;

    try {
      expect(() => {
        renderResult = render(<Button asChild />);
      }).not.toThrow();

      expect(renderResult).toBeDefined();
      const container = renderResult!.container;

      expect(container.firstChild).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        "[Button] `asChild` requires a single valid React element child.",
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("matches snapshot for secondary danger tone", () => {
    const { container } = render(
      <Button variant="secondary" tone="danger">
        Delete
      </Button>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("omits organic depth styles when the flag is disabled", () => {
    const { getByRole } = render(<Button>Classic button</Button>);

    expect(getByRole("button")).not.toHaveClass(styles.organicControl);
  });

  it("applies organic depth styles when the flag is enabled", () => {
    const { getByRole } = render(
      <DepthThemeProvider enabled={false} organicDepthEnabled>
        <Button>Organic button</Button>
      </DepthThemeProvider>,
    );

    expect(getByRole("button")).toHaveClass(styles.organicControl);
  });
});
