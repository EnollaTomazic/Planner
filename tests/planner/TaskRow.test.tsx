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

const noop = (): void => {};

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
        onToggle={noop}
        onDelete={noop}
        onEdit={noop}
        onSelect={noop}
        onAddImage={handleAddImage}
        onRemoveImage={noop}
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
        onToggle={noop}
        onDelete={noop}
        onEdit={noop}
        onSelect={noop}
        onAddImage={handleAddImage}
        onRemoveImage={noop}
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
});
