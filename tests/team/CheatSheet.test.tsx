import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import CheatSheet from "@/components/team/CheatSheet";

describe("CheatSheet editing sanitization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("keeps apostrophes and ampersands intact in titles", () => {
    render(<CheatSheet editing />);

    const firstCard = screen
      .getAllByRole("button", { name: "Edit" })[0]
      .closest("article");
    expect(firstCard).not.toBeNull();
    const card = firstCard as HTMLElement;

    const editButton = within(card).getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);

    const titleInput = within(card).getByLabelText("Archetype title") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Carry's & Supports" } });
    expect(titleInput.value).toBe("Carry's & Supports");

    const saveButton = within(card).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    expect(
      within(card).getByRole("heading", { name: "Carry's & Supports" }),
    ).toBeInTheDocument();

    const reopenButton = within(card).getByRole("button", { name: "Edit" });
    fireEvent.click(reopenButton);

    const reopenedInput = within(card).getByLabelText("Archetype title") as HTMLInputElement;
    expect(reopenedInput.value).toBe("Carry's & Supports");
  });

  it("round-trips apostrophes and ampersands in bullet lists", () => {
    render(<CheatSheet editing />);

    const firstCard = screen
      .getAllByRole("button", { name: "Edit" })[0]
      .closest("article");
    expect(firstCard).not.toBeNull();
    const card = firstCard as HTMLElement;

    const editButton = within(card).getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);

    const winsItem = within(card).getAllByRole("textbox", { name: "Wins when" })[0] as HTMLLIElement;
    const updatedText = "Peel & re-engage's call";
    winsItem.textContent = updatedText;
    fireEvent.input(winsItem);

    const saveButton = within(card).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    expect(within(card).getByText(updatedText)).toBeInTheDocument();

    const reopenButton = within(card).getByRole("button", { name: "Edit" });
    fireEvent.click(reopenButton);

    const reopenedWinsItem = within(card).getAllByRole("textbox", {
      name: "Wins when",
    })[0] as HTMLLIElement;
    expect(reopenedWinsItem.textContent).toBe(updatedText);
  });
});

