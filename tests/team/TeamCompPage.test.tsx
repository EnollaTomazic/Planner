import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TeamCompPage from "@/components/team/TeamCompPage";

describe("TeamCompPage builder tab", () => {
  it("shows builder hero with spacing", () => {
    render(<TeamCompPage />);
    const builderTab = screen.getByRole("tab", { name: "Builder" });
    fireEvent.click(builderTab);
    const heroHeading = screen.getByRole("heading", { name: "Builder" });
    expect(heroHeading).toBeInTheDocument();
    const cardParent = screen.getByText("Allies").closest("section")?.parentElement;
    expect(cardParent).toHaveClass("mt-6");
  });
});

describe("TeamCompPage jungle clears tab", () => {
  it("shows clears hero with search and count", () => {
    render(<TeamCompPage />);
    const clearsTab = screen.getAllByRole("tab", { name: "Jungle Clears" })[0];
    fireEvent.click(clearsTab);
    expect(
      screen.getByRole("heading", { name: "Clear Speed Buckets" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Filter by champion, type, or note..."
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/\d+ shown/i)).toBeInTheDocument();
  });
});
