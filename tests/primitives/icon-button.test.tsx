import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import IconButton from "../../src/components/ui/primitives/IconButton";

afterEach(cleanup);

describe("IconButton", () => {
  it("renders children", () => {
    const { getByRole } = render(<IconButton aria-label="up">up</IconButton>);
    expect(getByRole("button")).toHaveTextContent("up");
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(<IconButton aria-label="focus">X</IconButton>);
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

  const sizeCases = [
    ["xs", "h-8 w-8"],
    ["sm", "h-9 w-9"],
    ["md", "h-10 w-10"],
    ["lg", "h-11 w-11"],
    ["xl", "h-12 w-12"],
  ] as const;

  sizeCases.forEach(([size, cls]) => {
    it(`applies ${size} size classes`, () => {
      const { getByRole } = render(
        <IconButton size={size} aria-label={size} />,
      );
      expect(getByRole("button").className).toContain(cls);
    });
  });

  const iconCases = [
    ["xs", "[&_svg]:size-3"],
    ["sm", "[&_svg]:size-4"],
    ["md", "[&_svg]:size-5"],
    ["lg", "[&_svg]:size-6"],
    ["xl", "[&_svg]:size-7"],
  ] as const;

  iconCases.forEach(([iconSize, cls]) => {
    it(`applies ${iconSize} icon size classes`, () => {
      const { getByRole } = render(
        <IconButton iconSize={iconSize} aria-label={iconSize}>
          <svg />
        </IconButton>,
      );
      expect(getByRole("button").className).toContain(cls);
    });

    it(`applies ${iconSize} icon size classes for wrapped icons`, () => {
      const { getByRole } = render(
        <IconButton iconSize={iconSize} aria-label={iconSize}>
          <span>
            <svg />
          </span>
        </IconButton>,
      );
      expect(getByRole("button").className).toContain(cls);
    });
  });

  const defaultIconCases = [
    ["xs", "[&_svg]:size-3"],
    ["sm", "[&_svg]:size-3"],
    ["md", "[&_svg]:size-4"],
    ["lg", "[&_svg]:size-5"],
    ["xl", "[&_svg]:size-6"],
  ] as const;

  defaultIconCases.forEach(([size, cls]) => {
    it(`defaults to ${cls} for ${size} button`, () => {
      const { getByRole } = render(
        <IconButton size={size} aria-label={size}>
          <svg />
        </IconButton>,
      );
      expect(getByRole("button").className).toContain(cls);
    });
  });

  it("applies ring variant with primary tone", () => {
    const { getByRole } = render(
      <IconButton variant="ring" tone="primary" aria-label="rp" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35 hover:bg-[--hover]");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-line/35 text-foreground");
  });

  it("applies solid variant with accent tone", () => {
    const { getByRole } = render(
      <IconButton variant="solid" tone="accent" aria-label="sa" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("border-transparent bg-accent/15 text-accent");
    expect(classes).toContain("[--hover:hsl(var(--accent)/0.25)]");
  });

  it("applies glow variant with info tone", () => {
    const { getByRole } = render(
      <IconButton variant="glow" tone="info" aria-label="gi" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35");
    expect(classes).toContain("hover:bg-[--hover]");
    expect(classes).toContain("shadow-glow-current");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-accent-2/35 text-accent-2");
  });

  it("applies ring variant with danger tone", () => {
    const { getByRole } = render(
      <IconButton variant="ring" tone="danger" aria-label="rd" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35 hover:bg-[--hover]");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-danger/35 text-danger");
    expect(classes).not.toContain("shadow-glow-current");
  });

  it("uses title as the aria-label when no aria-label is provided", () => {
    const { getByRole } = render(
      <IconButton title="Open settings">
        <svg />
      </IconButton>,
    );
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Open settings");
    expect(button).toHaveAttribute("title", "Open settings");
  });

  it("logs an error when icon-only content is missing a label", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <IconButton
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({} as any)}
      >
        <svg />
      </IconButton>,
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "IconButton requires an `aria-label` or `title` when rendering icon-only content.",
        ),
      );
    });

    errorSpy.mockRestore();
  });
});
