import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PromptsHeader", () => {
  it("renders count and search input", () => {
    const handleQuery = vi.fn();
    vi.useFakeTimers();
    render(
      <PromptsHeader
        count={2}
        query="hello"
        onQueryChange={handleQuery}
      />,
    );

    expect(screen.getByText("Prompts")).toBeInTheDocument();
    expect(screen.getByText("2 saved")).toBeInTheDocument();
    const search = screen.getByPlaceholderText(
      "Search prompts…",
    ) as HTMLInputElement;
    expect(search.value).toBe("hello");
    fireEvent.change(search, { target: { value: "changed" } });
    vi.advanceTimersByTime(300);
    expect(handleQuery).toHaveBeenCalledWith("changed");
  });

  it("clears debounce timer on unmount", () => {
    const handleQuery = vi.fn();
    vi.useFakeTimers();
    const { unmount } = render(
      <PromptsHeader
        count={0}
        query=""
        onQueryChange={handleQuery}
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
