import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect } from "vitest";
import TimerTab from "@/components/goals/TimerTab";

afterEach(cleanup);

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
});
