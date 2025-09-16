import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PromptsHeader } from "@/components/prompts";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PromptsHeader", () => {
  it("renders count, search input, and disabled save button", () => {
    const handleQuery = vi.fn();
    const handleSave = vi.fn();
    render(
      <PromptsHeader
        count={2}
        query="hello"
        onQueryChange={handleQuery}
        onSave={handleSave}
        disabled
      />,
    );

    expect(screen.getByText("Prompts")).toBeInTheDocument();
    expect(screen.getByText("2 saved")).toBeInTheDocument();
    const search = screen.getByPlaceholderText(
      "Search prompts…",
    ) as HTMLInputElement;
    expect(search.value).toBe("hello");
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toBeDisabled();

    vi.useFakeTimers();
    fireEvent.change(search, { target: { value: "changed" } });
    vi.advanceTimersByTime(300);
    expect(handleQuery).toHaveBeenCalledWith("changed");
    vi.useRealTimers();
  });

  it("calls onSave when save button clicked", () => {
    const handleSave = vi.fn();
    render(
      <PromptsHeader
        count={0}
        query=""
        onQueryChange={() => {}}
        onSave={handleSave}
        disabled={false}
      />,
    );
    const save = screen.getByRole("button", { name: "Save" });
    fireEvent.click(save);
    expect(handleSave).toHaveBeenCalled();
  });

  it("clears debounce timer on unmount", () => {
    const handleQuery = vi.fn();
    vi.useFakeTimers();
    const { unmount } = render(
      <PromptsHeader
        count={0}
        query=""
        onQueryChange={handleQuery}
        onSave={() => {}}
        disabled={false}
      />,
    );
    const search = screen.getByPlaceholderText("Search prompts…");
    fireEvent.change(search, { target: { value: "abc" } });
    unmount();
    vi.advanceTimersByTime(300);
    expect(handleQuery).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
