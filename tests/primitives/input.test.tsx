import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Input, { type InputSize } from "../../src/components/ui/primitives/Input";

afterEach(cleanup);

describe("Input", () => {
  it("renders input element", () => {
    const { getByRole } = render(
      <Input aria-label="name" placeholder="Name" />,
    );
    expect(getByRole("textbox")).toHaveAttribute("placeholder", "Name");
  });

  it.each<[InputSize, string]>([
    ["sm", "var(--control-h-sm)"],
    ["md", "var(--control-h-md)"],
    ["lg", "var(--control-h-lg)"],
  ])("applies %s height", (size, value) => {
    const { getByRole } = render(
      <Input aria-label={size} height={size} />,
    );
    const wrapper = getByRole("textbox").parentElement as HTMLElement;
    expect(wrapper).toHaveStyle(`--control-h: ${value}`);
  });

  it("applies indent padding", () => {
    const { getByRole } = render(
      <Input aria-label="indent" indent />,
    );
    expect(getByRole("textbox")).toHaveClass("pl-[var(--space-7)]");
  });

  it("reserves end slot padding when hasEndSlot is true", () => {
    const { getByRole } = render(
      <Input aria-label="slot" hasEndSlot />,
    );
    expect(getByRole("textbox")).toHaveClass("pr-[var(--space-7)]");
  });

  it("shows error state when aria-invalid is true", () => {
    const { getByRole } = render(
      <Input aria-label="error" aria-invalid />,
    );
    const wrapper = getByRole("textbox").parentElement as HTMLElement;
    expect(wrapper).toHaveClass("ring-2", "ring-danger/35", "ring-offset-0");
  });

  it("applies disabled state", () => {
    const { getByRole } = render(
      <Input aria-label="disabled" disabled />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:opacity-[var(--disabled)]",
      "disabled:cursor-not-allowed",
    );
    const wrapper = input.parentElement as HTMLElement;
    expect(wrapper).toHaveClass(
      "opacity-[var(--disabled)]",
      "pointer-events-none",
    );
  });

  it("applies readOnly state", () => {
    const { getByRole } = render(
      <Input aria-label="readonly" readOnly />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("read-only:cursor-default");
    const wrapper = input.parentElement as HTMLElement;
    expect(wrapper).toHaveClass(
      "focus-within:after:bg-[var(--ring-muted)]",
    );
  });

  it("handles data-loading attribute", () => {
    const { getByRole } = render(
      <Input aria-label="loading" data-loading="true" />,
    );
    const input = getByRole("textbox");
    expect(input).toHaveAttribute("data-loading", "true");
    expect(input).toHaveClass(
      "data-[loading=true]:opacity-[var(--loading)]",
    );
  });

  it("defaults name to the generated id when no overrides are provided", () => {
    const { getByRole } = render(<Input aria-label="Generated" />);
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.id).toBeTruthy();
    expect(input.name).toBe(input.id);
  });

  it("derives name from aria-label when a custom id is supplied", () => {
    const { getByRole } = render(
      <Input id="email" aria-label="Email Address" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.id).toBe("email");
    expect(input.name).toBe("email-address");
  });

  it("prefers an explicit name prop", () => {
    const { getByRole } = render(
      <Input aria-label="Custom" name="custom-name" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.name).toBe("custom-name");
  });
});
