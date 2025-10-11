import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toast } from "@/components/ui/Toast";

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
    const { unmount: unmountAuto } = render(
      <Toast open onOpenChange={onChange} duration={1000}>
        Auto
      </Toast>,
    );
    vi.advanceTimersByTime(1000);
    expect(onChange).toHaveBeenCalledWith(false);
    unmountAuto();
    vi.useRealTimers();
  });

  it("pauses the timer while hovered", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <Toast open onOpenChange={onChange} duration={4000} showProgress>
        Message
      </Toast>,
    );
    const status = screen.getByText("Message").closest('[role="status"]') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
    vi.advanceTimersByTime(1000);
    fireEvent.pointerEnter(status);
    vi.advanceTimersByTime(5000);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerLeave(status);
    vi.advanceTimersByTime(2999);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it("pauses while any element inside has focus", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <Toast open onOpenChange={onChange} duration={3000} closable>
        Focusable toast
      </Toast>,
    );
    const close = screen.getByRole("button", { name: /close/i });
    vi.advanceTimersByTime(1200);
    fireEvent.focus(close);
    vi.advanceTimersByTime(5000);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(close);
    vi.advanceTimersByTime(1799);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});
