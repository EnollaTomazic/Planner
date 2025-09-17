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
          images: [],
        }}
        onToggle={noop}
        onDelete={noop}
        onEdit={noop}
        onSelect={noop}
        onAddImage={noop}
        onRemoveImage={noop}
      />,
    );
    const textButton = screen.getByRole("button", { name: "Test task" });
    fireEvent.doubleClick(textButton);
    const input = screen.getAllByRole("textbox")[0];
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
          images: [],
        }}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={noop}
        onSelect={onSelect}
        onAddImage={noop}
        onRemoveImage={noop}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Toggle Test task done")[0]);
    fireEvent.click(screen.getAllByLabelText("Edit task")[0]);
    fireEvent.click(screen.getAllByLabelText("Delete task")[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders images and supports add/remove", () => {
    const onAddImage = vi.fn();
    const onRemoveImage = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "With image",
          done: false,
          createdAt: Date.now(),
          images: ["https://example.com/a.jpg"],
        }}
        onToggle={noop}
        onDelete={noop}
        onEdit={noop}
        onSelect={noop}
        onAddImage={onAddImage}
        onRemoveImage={onRemoveImage}
      />,
    );
    const img = screen.getByRole("img", { name: /image for with image/i });
    expect(img).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Remove image")[0]);
    expect(onRemoveImage).toHaveBeenCalledWith("https://example.com/a.jpg");
  });

});
