import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PromptsHeader", () => {
  const createProps = () => ({
    query: "hello",
    onQueryChange: vi.fn(),
    activeTab: "chat" as const,
    onTabChange: vi.fn(),
    onNewPrompt: vi.fn(),
    onNewPersona: vi.fn(),
    tabCounts: {
      chat: 2,
      notes: 5,
    },
  });

  it("renders tabs with badges, actions, and search input", () => {
    const props = createProps();
    vi.useFakeTimers();
    render(<PromptsHeader {...props} />);

    expect(screen.getByText("Prompts")).toBeInTheDocument();
    expect(
      screen.getByText("Compose, save, and reuse AI prompts."),
    ).toBeInTheDocument();

    const chatTab = screen.getByRole("tab", { name: /ChatGPT2/ });
    expect(chatTab).toBeInTheDocument();
    expect(within(chatTab).getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Codex review" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Notes5/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New prompt" }));
    fireEvent.click(screen.getByRole("button", { name: "New persona" }));
    expect(props.onNewPrompt).toHaveBeenCalled();
    expect(props.onNewPersona).toHaveBeenCalled();

    const search = screen.getByPlaceholderText(
      "Search prompts…",
    ) as HTMLInputElement;
    expect(search.value).toBe("hello");
    fireEvent.change(search, { target: { value: "changed" } });
    vi.advanceTimersByTime(300);
    expect(props.onQueryChange).toHaveBeenCalledWith("changed");
  });

  it("clears debounce timer on unmount", () => {
    const props = createProps();
    vi.useFakeTimers();
    const { unmount } = render(
      <PromptsHeader
        {...props}
        query=""
        tabCounts={{}}
        onQueryChange={props.onQueryChange}
      />,
    );
    const search = screen.getByPlaceholderText("Search prompts…");
    fireEvent.change(search, { target: { value: "abc" } });
    unmount();
    vi.advanceTimersByTime(300);
    expect(props.onQueryChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
