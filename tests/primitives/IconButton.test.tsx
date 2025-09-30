import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import IconButton, {
  type IconButtonProps,
} from "../../src/components/ui/primitives/IconButton";

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
    ["sm", "h-[var(--control-h-sm)] w-[var(--control-h-sm)]"],
    ["md", "h-[var(--control-h-md)] w-[var(--control-h-md)]"],
    ["lg", "h-[var(--control-h-lg)] w-[var(--control-h-lg)]"],
    ["xl", "h-[var(--control-h-xl)] w-[var(--control-h-xl)]"],
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
    ["xs", "[&_svg]:size-[calc(var(--control-h-xs)/2)]"],
    ["sm", "[&_svg]:size-[calc(var(--control-h-sm)/2)]"],
    ["md", "[&_svg]:size-[calc(var(--control-h-md)/2)]"],
    ["lg", "[&_svg]:size-[calc(var(--control-h-lg)/2)]"],
    ["xl", "[&_svg]:size-[calc(var(--control-h-xl)/2)]"],
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
    ["sm", "[&_svg]:size-[calc(var(--control-h-sm)/2)]"],
    ["md", "[&_svg]:size-[calc(var(--control-h-md)/2)]"],
    ["lg", "[&_svg]:size-[calc(var(--control-h-lg)/2)]"],
    ["xl", "[&_svg]:size-[calc(var(--control-h-xl)/2)]"],
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

  it("applies ghost variant with primary tone", () => {
    const { getByRole } = render(
      <IconButton variant="ghost" tone="primary" aria-label="gp" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border-[hsl(var(--line)/0.35)] text-foreground");
    expect(classes).toContain("[--neu-surface:hsl(var(--card)/0.35)]");
    expect(classes).toContain("[--hover:hsl(var(--foreground)/0.1)]");
    expect(classes).toContain("[--active:hsl(var(--foreground)/0.2)]");
  });

  it("applies primary variant with accent tone", () => {
    const { getByRole } = render(
      <IconButton variant="primary" tone="accent" aria-label="pa" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("shadow-glow-sm");
    expect(classes).toContain("hover:shadow-btn-primary-hover");
    expect(classes).toContain("active:shadow-btn-primary-active");
    expect(classes).toContain(
      "border-[hsl(var(--accent)/0.35)] [--neu-surface:hsl(var(--accent)/0.12)]",
    );
    expect(classes).toContain("text-on-accent");
    expect(classes).toContain(
      "[--glow-active:hsl(var(--accent)/0.35)]",
    );
    expect(classes).toContain(
      "[--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--accent)/0.25)]",
    );
    expect(classes).toContain(
      "[--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--accent)/0.6)]",
    );
    expect(classes).toContain("[--hover:hsl(var(--accent)/0.14)]");
    expect(classes).toContain("[--active:hsl(var(--accent)/0.2)]");
  });

  it("applies secondary variant with info tone", () => {
    const { getByRole } = render(
      <IconButton variant="secondary" tone="info" aria-label="si" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain("shadow-control");
    expect(classes).toContain("hover:shadow-control-hover");
    expect(classes).toContain("active:shadow-inner-md");
    expect(classes).toContain("text-on-accent");
    expect(classes).toContain("[--neu-surface:hsl(var(--accent-2)/0.25)]");
    expect(classes).toContain("[--hover:hsl(var(--accent-2)/0.2)]");
    expect(classes).toContain("[--active:hsl(var(--accent-2)/0.15)]");
  });

  it("applies ghost variant with danger tone", () => {
    const { getByRole } = render(
      <IconButton variant="ghost" tone="danger" aria-label="gd" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border-danger/35 text-danger");
    expect(classes).toContain("[--neu-surface:hsl(var(--danger)/0.12)]");
    expect(classes).toContain("[--hover:hsl(var(--danger)/0.1)]");
    expect(classes).toContain("[--active:hsl(var(--danger)/0.2)]");
    expect(classes).not.toContain("shadow-glow-current");
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
          {...({} as unknown as IconButtonProps)}
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
