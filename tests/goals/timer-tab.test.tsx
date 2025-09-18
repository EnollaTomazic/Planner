import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import TimerTab from "@/components/goals/TimerTab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TimerTab", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("resets remaining time and stops when switching profiles", () => {
    render(<TimerTab />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("tab", { name: "Cleaning" }));
    expect(screen.getByText("30:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("allows manual time editing in Custom profile", () => {
    render(<TimerTab />);
    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
    const input = screen.getByLabelText("Edit minutes and seconds");
    fireEvent.change(input, { target: { value: "5:30" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
    expect(screen.getByText("05:30")).toBeInTheDocument();
  });

  it("adjusts custom minutes with plus and minus buttons", () => {
    render(<TimerTab />);
    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
    fireEvent.click(screen.getByTitle("Plus 1 minute"));
    expect(screen.getByText("26:00")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Minus 1 minute"));
    fireEvent.click(screen.getByTitle("Minus 1 minute"));
    expect(screen.getByText("24:00")).toBeInTheDocument();
  });

  it("stops running when the timer completes", () => {
    vi.useFakeTimers();
    render(<TimerTab />);
    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
    const customInput = screen.getByLabelText("Custom minutes and seconds");
    fireEvent.change(customInput, { target: { value: "0:01" } });
    fireEvent.keyDown(customInput, { key: "Enter", code: "Enter", charCode: 13 });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });
});
