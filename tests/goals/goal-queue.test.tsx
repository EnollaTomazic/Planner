import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, afterEach, expect, vi } from "vitest";
import GoalQueue from "@/components/goals/GoalQueue";

describe("GoalQueue", () => {
  afterEach(cleanup);

  it("associates the add input with its label", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<GoalQueue items={[]} onAdd={onAdd} onRemove={onRemove} />);

    const input = screen.getByLabelText("Add to queue and press Enter");
    const form = input.closest("form");
    if (!form) {
      throw new Error("Expected add input to be wrapped in a form");
    }

    fireEvent.change(input, { target: { value: "Review accessibility" } });
    fireEvent.submit(form);

    expect(onAdd).toHaveBeenCalledWith("Review accessibility");
  });
});
