import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => true };
});

import Sheet from "@/components/ui/Sheet";

describe("Sheet", () => {
  it("locks scroll and closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} aria-labelledby="s">
        <h2 id="s">Title</h2>
        <button>ok</button>
      </Sheet>,
    );
    const dialog = screen.getByRole("dialog");
    const wrapper = dialog.parentElement as HTMLElement;
    const dur = getComputedStyle(wrapper).transitionDuration;
    expect(["0s", ""].includes(dur)).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
