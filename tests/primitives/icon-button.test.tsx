import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
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
    ["xs", "h-[var(--space-5)] w-[var(--space-5)]"],
    ["sm", "h-[var(--control-h-sm)] w-[var(--control-h-sm)]"],
    ["md", "h-[var(--control-h-md)] w-[var(--control-h-md)]"],
    ["lg", "h-[var(--control-h-lg)] w-[var(--control-h-lg)]"],
    ["xl", "h-[var(--space-8)] w-[var(--space-8)]"],
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
    ["xs", "[&_svg]:size-[var(--space-3)]"],
    ["sm", "[&_svg]:size-[var(--space-4)]"],
    ["md", "[&_svg]:size-[var(--space-5)]"],
    ["lg", "[&_svg]:size-[var(--space-6)]"],
    ["xl", "[&_svg]:size-[var(--space-7)]"],
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
    ["xs", "[&_svg]:size-[var(--space-3)]"],
    ["sm", "[&_svg]:size-[var(--space-3)]"],
    ["md", "[&_svg]:size-[var(--space-4)]"],
    ["lg", "[&_svg]:size-[var(--space-5)]"],
    ["xl", "[&_svg]:size-[var(--space-6)]"],
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

  it("applies secondary variant with primary tone", () => {
    const { getByRole } = render(
      <IconButton variant="secondary" tone="primary" aria-label="sp" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("border-line/35");
    expect(classes).toContain("bg-panel/60");
    expect(classes).toContain("text-muted-foreground");
    expect(classes).toContain("[--hover:hsl(var(--primary)/0.25)]");
    expect(classes).toContain("[--active:hsl(var(--primary)/0.35)]");
  });

  it("applies primary variant with accent tone", () => {
    const { getByRole } = render(
      <IconButton variant="primary" tone="accent" aria-label="pa" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("bg-[hsl(var(--accent)/0.12)]");
    expect(classes).toContain("text-[var(--text-on-accent)]");
    expect(classes).toContain("border-[hsl(var(--accent)/0.35)]");
    expect(classes).toContain(
      "[--hover:theme('colors.interaction.accent.hover')]");
    expect(classes).toContain(
      "[--active:theme('colors.interaction.accent.active')]");
  });

  it("applies ghost variant with info tone", () => {
    const { getByRole } = render(
      <IconButton variant="ghost" tone="info" aria-label="gi" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("border-transparent");
    expect(classes).toContain("bg-accent-2/20");
    expect(classes).toContain("text-[var(--text-on-accent)]");
    expect(classes).toContain(
      "[--hover:theme('colors.interaction.info.surfaceHover')]");
    expect(classes).toContain(
      "[--active:theme('colors.interaction.info.surfaceActive')]");
  });

  it("applies secondary variant with danger tone", () => {
    const { getByRole } = render(
      <IconButton variant="secondary" tone="danger" aria-label="sd" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("border-[hsl(var(--danger)/0.4)]");
    expect(classes).toContain("bg-danger/25");
    expect(classes).toContain("text-danger-foreground");
    expect(classes).toContain(
      "[--hover:theme('colors.interaction.danger.hover')]");
    expect(classes).toContain(
      "[--active:theme('colors.interaction.danger.active')]");
  });

  it("forwards the title attribute", () => {
    const { getByRole } = render(
      <IconButton aria-label="Settings" title="Open settings">
        <svg />
      </IconButton>,
    );
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Settings");
    expect(button).toHaveAttribute("title", "Open settings");
  });

  it("mirrors title to aria-label when icon-only content has no label", () => {
    const { getByRole } = render(
      <IconButton title="Refresh data">
        <svg />
      </IconButton>,
    );
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Refresh data");
    expect(button).toHaveAttribute("title", "Refresh data");
  });

  it("supports aria-labelledby for external labels", () => {
    const { getByRole } = render(
      <IconButton aria-labelledby="external-label">
        <svg />
      </IconButton>,
    );
    const button = getByRole("button");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveAttribute("aria-labelledby", "external-label");
  });

  describe("accessibility warnings", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("logs an error when icon-only content is missing a label", async () => {
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
            "IconButton requires an accessible name (`aria-label`, `aria-labelledby`, or `title`) when rendering icon-only content.",
          ),
        );
      });
    });

    it("does not log an error when icon-only content has aria-label", async () => {
      render(
        <IconButton aria-label="Settings">
          <svg />
        </IconButton>,
      );

      await waitFor(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    it("does not log an error when icon-only content has a title", async () => {
      render(
        <IconButton title="Refresh data">
          <svg />
        </IconButton>,
      );

      await waitFor(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    it("does not log an error when icon-only content has aria-labelledby", async () => {
      render(
        <IconButton aria-labelledby="external-label">
          <svg />
        </IconButton>,
      );

      await waitFor(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    it("does not log an error when text content is present", async () => {
      render(<IconButton aria-label="  ">Submit</IconButton>);

      await waitFor(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });
  });
});
