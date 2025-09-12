import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TaskRow from "@/components/planner/TaskRow";

const noop = (): void => {};

describe("TaskRow", () => {
  it("focuses input when entering edit mode", async () => {
    render(
      <TaskRow
        task={{
          id: "1",
          title: "Test task",
          done: false,
          createdAt: Date.now(),
        }}
        onToggle={noop}
        onDelete={noop}
        onEdit={noop}
        onSelect={noop}
      />,
    );
    const textButton = screen.getByRole("button", { name: "Test task" });
    fireEvent.doubleClick(textButton);
    const input = screen.getByRole("textbox");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("does not propagate row selection from inner controls", () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "Test task",
          done: false,
          createdAt: Date.now(),
        }}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={noop}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Toggle task done")[0]);
    fireEvent.click(screen.getAllByLabelText("Edit task")[0]);
    fireEvent.click(screen.getAllByLabelText("Delete task")[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
