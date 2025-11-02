import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/lib/theme-context";
import { PromptsPage } from "@/components/prompts/PromptsPage";
import { PROMPTS_HEADER_CHIPS } from "@/components/prompts/headerChips";
import { resetLocalStorage } from "../setup";

const renderPromptsPage = () =>
  render(
    <ThemeProvider>
      <PromptsPage />
    </ThemeProvider>,
  );

afterEach(() => {
  cleanup();
});

describe("Prompts header", () => {
  beforeEach(() => {
    resetLocalStorage();
  });

  it("renders the shared header with search, saved pill, and chips", () => {
    renderPromptsPage();

    expect(screen.getByRole("heading", { name: "Prompts" })).toBeInTheDocument();
    expect(screen.getByText("0 saved")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("Search prompts…");
    expect(search).toBeInTheDocument();

    const chipButtons = PROMPTS_HEADER_CHIPS.map((chip) =>
      screen.getByRole("button", { name: chip }),
    );

    expect(chipButtons).toHaveLength(5);
    chipButtons.forEach((chip) => {
      expect(chip).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("toggles the active chip and syncs the search query", async () => {
    renderPromptsPage();

    const search = screen.getByPlaceholderText("Search prompts…") as HTMLInputElement;
    const hoverChip = screen.getByRole("button", { name: "hover" });

    fireEvent.click(hoverChip);
    await waitFor(() => expect(search.value).toBe("hover"));
    await waitFor(() =>
      expect(hoverChip).toHaveAttribute("aria-pressed", "true"),
    );

    fireEvent.click(hoverChip);
    await waitFor(() => expect(search.value).toBe(""));
    await waitFor(() =>
      expect(hoverChip).toHaveAttribute("aria-pressed", "false"),
    );
  });
});
