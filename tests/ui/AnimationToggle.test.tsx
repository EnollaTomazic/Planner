import React from "react";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AnimationToggle } from "@/components/ui/AnimationToggle";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("no-animations");
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("no-animations");
});

describe("AnimationToggle", () => {
  it("renders a pressed button by default", async () => {
    const { getByRole } = render(<AnimationToggle />);
    const button = getByRole("button", { name: "Disable animations" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      expect(document.documentElement.classList.contains("no-animations")).toBe(
        false,
      );
    });
  });

  it("toggles animations and updates aria attributes", async () => {
    const { getByRole } = render(<AnimationToggle />);
    const button = getByRole("button");
    fireEvent.click(button);
    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).toHaveAttribute("aria-label", "Enable animations");
      expect(document.documentElement.classList.contains("no-animations")).toBe(
        true,
      );
    });
  });

  it("removes reduced motion class when unmounted while disabled", async () => {
    const { getByRole, unmount } = render(<AnimationToggle />);
    const button = getByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("no-animations")).toBe(
        true,
      );
    });

    unmount();

    expect(document.documentElement.classList.contains("no-animations")).toBe(
      false,
    );
  });

  it("is focusable for keyboard users", () => {
    const { getByRole } = render(<AnimationToggle />);
    const button = getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("is disabled and shows a spinner when loading", () => {
    const { getByRole, getByLabelText } = render(<AnimationToggle loading />);
    const button = getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(getByLabelText("Loading")).toBeInTheDocument();
  });
});
