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
    const field = getByRole("textbox").parentElement as HTMLElement;
    expect(field).toHaveStyle(`--field-h: ${value}`);
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
    const field = getByRole("textbox").parentElement as HTMLElement;
    expect(field.dataset.invalid).toBe("true");
    expect(field.className).toContain("border-[hsl(var(--danger)/0.6)]");
  });

  it("applies disabled state", () => {
    const { getByRole } = render(
      <Input aria-label="disabled" disabled />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input.className).toContain("group-data-[disabled=true]/field:placeholder:text-muted-foreground/50");
    const field = input.parentElement as HTMLElement;
    expect(field.dataset.disabled).toBe("true");
  });

  it("applies readOnly state", () => {
    const { getByRole } = render(
      <Input aria-label="readonly" readOnly />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("read-only:cursor-default");
    const field = input.parentElement as HTMLElement;
    expect(field.dataset.readonly).toBe("true");
  });

  it("handles data-loading attribute", () => {
    const { getByRole } = render(
      <Input aria-label="loading" data-loading="true" />,
    );
    const input = getByRole("textbox");
    expect(input).toHaveAttribute("data-loading", "true");
    expect(input.className).toContain(
      "group-data-[loading=true]/field:opacity-[var(--loading)]",
    );
    const field = input.parentElement as HTMLElement;
    expect(field.dataset.loading).toBe("true");
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
