import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Toast from "@/components/ui/Toast";

describe("Toast", () => {
  it("announces and auto dismisses", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { unmount } = render(
      <Toast open onOpenChange={onChange} duration={1000} closable>
        Message
      </Toast>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    const btn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(false);
    onChange.mockClear();
    unmount();
    render(
      <Toast open onOpenChange={onChange} duration={1000}>
        Auto
      </Toast>,
    );
    vi.advanceTimersByTime(1000);
    expect(onChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});
