import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, afterEach, expect, vi } from "vitest";
import { GoalQueue } from "@/components/goals/GoalQueue";

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

  it("labels the delete button with the goal text", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const createdAt = Date.now();
    render(
      <GoalQueue
        items={[{ id: "g1", text: "Review weekly plan", createdAt }]}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete queued goal Review weekly plan",
    });

    fireEvent.click(deleteButton);

    expect(onRemove).toHaveBeenCalledWith("g1");
  });

  it("truncates long goal text in the delete button label", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const createdAt = Date.now();
    render(
      <GoalQueue
        items={[
          {
            id: "g2",
            text: "Plan quarterly roadmap with design and engineering leadership sync",
            createdAt,
          },
        ]}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete queued goal Plan quarterly roadmap with design and engineer…",
    });

    expect(deleteButton).toBeInTheDocument();
  });
});
