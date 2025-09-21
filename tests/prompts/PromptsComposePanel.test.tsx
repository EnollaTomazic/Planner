import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PromptsComposePanel } from "@/components/prompts";

afterEach(cleanup);

describe("PromptsComposePanel", () => {
  it("renders fields and handles changes", () => {
    const handleTitle = vi.fn();
    const handleText = vi.fn();
    const { container } = render(
      <PromptsComposePanel
        title="Title"
        onTitleChange={handleTitle}
        text="Text"
        onTextChange={handleText}
      />,
    );

    const titleInput = screen.getByLabelText("Title");
    const textarea = screen.getByLabelText("Prompt");
    expect(titleInput).toHaveValue("Title");
    expect(textarea).toHaveValue("Text");
    const help = screen.getByText("Add a short title");
    expect(titleInput).toHaveAttribute("aria-describedby", help.id);
    expect(
      screen.queryByRole("button", { name: "Confirm" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector("svg[aria-hidden='true']")).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "New" } });
    expect(handleTitle).toHaveBeenCalledWith("New");
    fireEvent.change(textarea, { target: { value: "Body" } });
    expect(handleText).toHaveBeenCalledWith("Body");
  });
});
