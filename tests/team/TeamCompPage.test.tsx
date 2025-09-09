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
