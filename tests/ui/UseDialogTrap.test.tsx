import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useDialogTrap } from "@/components/ui/hooks/useDialogTrap";

type TestDialogProps = {
  open: boolean;
  onClose: () => void;
};

function TestDialog({ open, onClose }: TestDialogProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  useDialogTrap({ open, onClose, ref });

  return (
    <div>
      <button type="button">Outside control</button>
      <div ref={ref} role="dialog" aria-modal="true">
        <button type="button">First action</button>
        <button type="button">Middle action</button>
        <button type="button">Last action</button>
      </div>
    </div>
  );
}

describe("UseDialogTrap", () => {
  it("traps focus inside the dialog and invokes onClose on Escape", async () => {
    const onClose = vi.fn();

    render(<TestDialog open onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const firstButton = screen.getByRole("button", { name: "First action" });
    const middleButton = screen.getByRole("button", { name: "Middle action" });
    const lastButton = screen.getByRole("button", { name: "Last action" });
    const outsideButton = screen.getByRole("button", { name: "Outside control" });

    await waitFor(() => expect(firstButton).toHaveFocus());

    outsideButton.focus();
    expect(outsideButton).toHaveFocus();
    fireEvent.keyDown(outsideButton, { key: "Tab" });
    expect(firstButton).toHaveFocus();

    lastButton.focus();
    expect(lastButton).toHaveFocus();
    fireEvent.keyDown(lastButton, { key: "Tab" });
    expect(firstButton).toHaveFocus();

    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: "Tab", shiftKey: true });
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(middleButton, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
