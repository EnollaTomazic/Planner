import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PromptsComposePanel } from "@/components/prompts";

afterEach(cleanup);

describe("PromptsComposePanel", () => {
  it("renders fields and handles changes", () => {
    const handleTitle = vi.fn();
    const handleText = vi.fn();
    render(
      <PromptsComposePanel
        title="Title"
        onTitleChange={handleTitle}
        text="Text"
        onTextChange={handleText}
      />,
    );

    const titleInput = screen.getByPlaceholderText("Title");
    const textarea = screen.getByPlaceholderText(
      "Write your prompt or snippet…",
    );
    expect(titleInput).toHaveValue("Title");
    expect(textarea).toHaveValue("Text");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "New" } });
    expect(handleTitle).toHaveBeenCalledWith("New");
    fireEvent.change(textarea, { target: { value: "Body" } });
    expect(handleText).toHaveBeenCalledWith("Body");
  });
});
