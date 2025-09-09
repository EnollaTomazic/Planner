import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskRow from "@/components/planner/TaskRow";

const noop = (): void => {};

describe("TaskRow", () => {
  it("focuses input when entering edit mode", async () => {
    render(
      <TaskRow
        task={{ id: "1", text: "Test task", done: false }}
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
});
