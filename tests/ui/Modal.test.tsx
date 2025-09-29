import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("traps focus, locks scroll and closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} aria-labelledby="h" aria-describedby="d">
        <h2 id="h">Heading</h2>
        <p id="d">Desc</p>
        <button>ok</button>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await waitFor(() =>
      expect(document.body).toHaveAttribute("data-dialog-lock", "true"),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
