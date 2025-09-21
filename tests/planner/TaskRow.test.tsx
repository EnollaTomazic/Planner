import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TaskRow from "@/components/planner/TaskRow";

const noop = (..._args: unknown[]): void => {};

describe("TaskRow", () => {
  afterEach(cleanup);

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
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={noop}
        removeImage={noop}
      />,
    );
    const textButton = screen.getByRole("button", { name: "Test task" });
    fireEvent.doubleClick(textButton);
    const input = screen.getByLabelText("Rename task Test task");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("does not propagate row selection from inner controls", () => {
    const selectTask = vi.fn();
    const toggleTask = vi.fn();
    const deleteTask = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "Test task",
          done: false,
          createdAt: Date.now(),
          images: [],
        }}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        renameTask={noop}
        selectTask={selectTask}
        addImage={noop}
        removeImage={noop}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Toggle Test task done")[0]);
    fireEvent.click(screen.getAllByLabelText("Edit task")[0]);
    fireEvent.click(screen.getAllByLabelText("Delete task")[0]);
    expect(selectTask).not.toHaveBeenCalled();
  });

  it("renders images and supports add/remove", () => {
    const addImage = vi.fn();
    const removeImage = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "With image",
          done: false,
          createdAt: Date.now(),
          images: ["https://example.com/a.jpg"],
        }}
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={addImage}
        removeImage={removeImage}
      />,
    );
    const img = screen.getByRole("img", { name: /image for with image/i });
    expect(img).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Remove image")[0]);
    expect(removeImage).toHaveBeenCalledWith("https://example.com/a.jpg", 0);
  });

  it("passes the correct index when removing duplicate images", () => {
    const removeImage = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "With duplicates",
          done: false,
          createdAt: Date.now(),
          images: [
            "https://example.com/a.jpg",
            "https://example.com/a.jpg",
          ],
        }}
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={noop}
        removeImage={removeImage}
      />,
    );

    const removeButtons = screen.getAllByLabelText("Remove image");
    fireEvent.click(removeButtons[1]);
    expect(removeImage).toHaveBeenCalledTimes(1);
    expect(removeImage).toHaveBeenCalledWith("https://example.com/a.jpg", 1);
  });

  it("allows adding an image via the attach button", () => {
    let addedUrl: string | null = null;
    const handleAddImage = (url: string) => {
      addedUrl = url;
    };
    render(
      <TaskRow
        task={{
          id: "1",
          title: "Attachable",
          done: false,
          createdAt: Date.now(),
          images: [],
        }}
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={handleAddImage}
        removeImage={noop}
      />,
    );
    const input = screen.getByLabelText("Add image URL");
    const form = input.closest("form") as HTMLFormElement;
    const attachButton = within(form).getByRole("button", { name: /attach image/i });
    expect(attachButton).toBeDisabled();
    fireEvent.change(input, {
      target: { value: " https://example.com/new.png " },
    });
    expect(attachButton).not.toBeDisabled();
    expect(attachButton).toHaveAttribute("type", "submit");
    fireEvent.submit(form);
    expect(addedUrl).toBe("https://example.com/new.png");
    expect(input).toHaveValue("");
    expect(attachButton).toBeDisabled();
  });

  it("rejects non-https image URLs", async () => {
    const handleAddImage = vi.fn();
    render(
      <TaskRow
        task={{
          id: "1",
          title: "Attachable",
          done: false,
          createdAt: Date.now(),
          images: [],
        }}
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={handleAddImage}
        removeImage={noop}
      />,
    );

    const input = screen.getByLabelText("Add image URL");
    const form = input.closest("form") as HTMLFormElement;

    fireEvent.change(input, {
      target: { value: "http://example.com/insecure.png" },
    });
    fireEvent.submit(form);

    await screen.findByText("Image URL must start with https.");
    expect(handleAddImage).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("falls back to a generic rename label when the task title is empty", () => {
    render(
      <TaskRow
        task={{
          id: "1",
          title: "   ",
          done: false,
          createdAt: Date.now(),
          images: [],
        }}
        toggleTask={noop}
        deleteTask={noop}
        renameTask={noop}
        selectTask={noop}
        addImage={noop}
        removeImage={noop}
      />,
    );

    const editButton = screen.getAllByLabelText("Edit task")[0];
    fireEvent.click(editButton);

    expect(screen.getByLabelText("Rename task")).toBeInTheDocument();
  });
});
