import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => true };
});

import Sheet from "@/components/ui/Sheet";

describe("Sheet", () => {
  afterEach(cleanup);

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

  it("traps focus on contenteditable regions", () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} aria-labelledby="s">
        <h2 id="s">Title</h2>
        <div data-testid="editable" contentEditable />
        <button>Close</button>
      </Sheet>,
    );

    const editable = screen.getByTestId("editable");
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(editable).toHaveAttribute("contenteditable", "true");

    closeButton.focus();
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(closeButton, { key: "Tab" });
    expect(editable).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });
});
