import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import PageHeaderDemo from "@/components/prompts/PageHeaderDemo";
import { ThemeProvider } from "@/lib/theme-context";

afterEach(cleanup);

describe("PageHeaderDemo", () => {
  it("toggles notifications aria-pressed state", () => {
    render(
      <ThemeProvider>
        <PageHeaderDemo />
      </ThemeProvider>,
    );

    const notifications = screen.getByRole("button", {
      name: "Show notifications",
    });

    expect(notifications).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(notifications);
    expect(notifications).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(notifications);
    expect(notifications).toHaveAttribute("aria-pressed", "true");
  });
});
