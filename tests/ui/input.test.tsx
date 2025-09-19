import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Input } from "@/components/ui";
import { slugify } from "@/lib/utils";

afterEach(cleanup);

describe("Input", () => {
  it("renders default state", () => {
    const { container } = render(<Input aria-label="test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders focus state", () => {
    const { container, getByRole } = render(<Input aria-label="test" />);
    fireEvent.focus(getByRole("textbox"));
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders error state", () => {
    const { container } = render(
      <Input aria-label="test" aria-invalid="true" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('handles aria-invalid="false" as non-error', () => {
    const { container } = render(
      <Input aria-label="test" aria-invalid="false" />,
    );
    expect(container.firstChild).not.toHaveClass(
      "border-[hsl(var(--danger)/0.6)]",
    );
  });

  it("renders disabled state", () => {
    const { container } = render(<Input aria-label="test" disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("adds padding when children are present", () => {
    const { getByRole } = render(
      <Input aria-label="test">
        <span />
      </Input>,
    );
    expect(getByRole("textbox")).toHaveClass(
      "pr-[calc(var(--space-6)+var(--space-2))]",
    );
  });

  it("adds padding when hasEndSlot is true", () => {
    const { getByRole } = render(<Input aria-label="test" hasEndSlot />);
    expect(getByRole("textbox")).toHaveClass(
      "pr-[calc(var(--space-6)+var(--space-2))]",
    );
  });

  it("applies left padding when indent is true", () => {
    const { getByRole } = render(<Input aria-label="indent" indent />);
    expect(getByRole("textbox")).toHaveClass("pl-[var(--space-7)]");
  });

  it("has smaller padding by default", () => {
    const { getByRole } = render(<Input aria-label="test" />);
    expect(getByRole("textbox")).not.toHaveClass("pr-[var(--space-7)]");
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(<Input aria-label="outline" />);
    const input = getByRole("textbox");
    fireEvent.focus(input);
    const style = getComputedStyle(input);
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(
      true,
    );
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(
      true,
    );
  });

  it("defaults name to generated id", () => {
    const { getByRole } = render(<Input aria-label="name" />);
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.name).toBe(input.id);
  });

  it("uses slugified label when custom id provided", () => {
    const { getByRole } = render(
      <Input id="email" aria-label="Email Address" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.id).toBe("email");
    expect(input.name).toBe(slugify("Email Address"));
  });
});
