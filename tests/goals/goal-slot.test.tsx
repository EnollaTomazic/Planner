import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { GoalSlot } from "@/components/goals";

afterEach(cleanup);

describe("GoalSlot", () => {
  const goal = {
    id: "g1",
    title: "Initial",
    done: false,
    createdAt: Date.now(),
  };

  it("edits title and calls onEdit", async () => {
    const onEdit = vi.fn();
    render(<GoalSlot goal={goal} onEdit={onEdit} />);
    const editBtn = screen.getByLabelText("Edit goal");
    fireEvent.click(editBtn);
    const input = screen.getByRole("textbox", { name: "Goal title" });
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onEdit).toHaveBeenCalledWith("g1", "Updated");
    expect(screen.queryByRole("textbox", { name: "Goal title" })).toBeNull();
  });

  it("cancels edit without calling onEdit", async () => {
    const onEdit = vi.fn();
    render(<GoalSlot goal={goal} onEdit={onEdit} />);
    const editBtn = screen.getByLabelText("Edit goal");
    fireEvent.click(editBtn);
    const input = screen.getByRole("textbox", { name: "Goal title" });
    fireEvent.change(input, { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox", { name: "Goal title" })).toBeNull();
    const editBtnAfter = screen.getByLabelText("Edit goal");
    await waitFor(() => expect(document.activeElement).toBe(editBtnAfter));
  });

  it("does not use window.prompt", () => {
    const promptSpy = vi.spyOn(window, "prompt");
    const onEdit = vi.fn();
    render(<GoalSlot goal={goal} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText("Edit goal"));
    expect(promptSpy).not.toHaveBeenCalled();
    promptSpy.mockRestore();
  });
});
