import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
  waitFor,
} from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { GoalsPage } from "@/components/goals";
import { createStorageKey } from "@/lib/db";

// Clean up DOM after each test
afterEach(cleanup);

function getGoalFormAddButton(): HTMLButtonElement {
  const buttons = screen.getAllByRole("button", { name: /add goal/i });
  const formButton = buttons.find((button) => button.closest("form"));
  if (!formButton) {
    throw new Error("Expected goal form submission button to be present");
  }
  return formButton as HTMLButtonElement;
}

describe("GoalsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders hero heading, subtitle, and progress summary", () => {
    render(<GoalsPage />);
    const heroRegion = screen.getByRole("region", { name: "Goals" });
    expect(
      within(heroRegion).getByRole("heading", { name: "Goals" }),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByText("Set and achieve your objectives."),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByRole("img", { name: "0% of goals completed" }),
    ).toBeInTheDocument();

    const capStat = within(heroRegion)
      .getByText("Cap", { selector: "dt" })
      .parentElement as HTMLElement;
    const activeStat = within(heroRegion)
      .getByText("Active", { selector: "dt" })
      .parentElement as HTMLElement;
    const remainingStat = within(heroRegion)
      .getByText("Remaining", { selector: "dt" })
      .parentElement as HTMLElement;
    const doneStat = within(heroRegion)
      .getByText("Done", { selector: "dt" })
      .parentElement as HTMLElement;
    const totalStat = within(heroRegion)
      .getByText("Total", { selector: "dt" })
      .parentElement as HTMLElement;

    expect(capStat).toHaveTextContent(/Cap\s*3\s*active/i);
    expect(activeStat).toHaveTextContent(/Active\s*0\s*live/i);
    expect(remainingStat).toHaveTextContent(/Remaining\s*3/);
    expect(doneStat).toHaveTextContent(/Done\s*0\s*\(0%\)/);
    expect(totalStat).toHaveTextContent(/Total\s*0/);

    expect(
      within(heroRegion).getByRole("button", { name: "Add Goal" }),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByRole("button", { name: "Reset All Goals" }),
    ).toBeDisabled();
  });

  it("allows editing goal fields", async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const metricInput = screen.getByRole("textbox", { name: "Metric (optional)" });
    const addButton = getGoalFormAddButton();

    fireEvent.change(titleInput, { target: { value: "Initial" } });
    fireEvent.change(metricInput, { target: { value: "5" } });
    fireEvent.click(addButton);

    const goalTitle = await screen.findByText("Initial");
    const article = goalTitle.closest("article") as HTMLElement;

    const editButton = within(article).getByRole("button", { name: "Edit goal" });
    fireEvent.click(editButton);

    const editTitle = await within(article).findByPlaceholderText("Title");
    fireEvent.change(editTitle, { target: { value: "Updated" } });
    const editMetric = await within(article).findByPlaceholderText("Metric");
    fireEvent.change(editMetric, { target: { value: "10" } });

    const saveButton = within(article).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    expect(await screen.findByText("Updated")).toBeInTheDocument();
    const metricLabel = within(article).getByText("Metric:");
    expect(metricLabel.parentElement?.textContent).toBe("Metric: 10");
  });

  it("updates hero progress stats when goals change", async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const addButton = getGoalFormAddButton();

    fireEvent.change(titleInput, { target: { value: "Goal A" } });
    fireEvent.click(addButton);
    await screen.findByText("Goal A");

    fireEvent.change(titleInput, { target: { value: "Goal B" } });
    fireEvent.click(addButton);
    const goalB = await screen.findByText("Goal B");

    const heroRegion = screen.getByRole("region", { name: "Goals" });
    expect(
      within(heroRegion).getByRole("img", { name: "0% of goals completed" }),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByText("Remaining", { selector: "dt" })
        .nextElementSibling,
    ).toHaveTextContent("1");

    const goalBCard = goalB.closest("article") as HTMLElement;
    const toggle = within(goalBCard).getByRole("checkbox", {
      name: /mark done/i,
    });
    fireEvent.click(toggle);

    expect(
      within(heroRegion).getByRole("img", {
        name: "50% of goals completed",
      }),
    ).toBeInTheDocument();
    const doneStat = within(heroRegion)
      .getByText("Done", { selector: "dt" })
      .nextElementSibling as HTMLElement;
    expect(doneStat).toHaveTextContent("1 (50%)");
  });

  it("shows domain in reminders hero and updates on change", () => {
    render(<GoalsPage />);

    const remindersTab = screen.getByRole("tab", { name: "Reminders" });
    fireEvent.click(remindersTab);

    const heroSection = screen
      .getByRole("heading", { name: "Reminders" })
      .closest("section") as HTMLElement;
    const initialDomainLabel = within(heroSection)
      .getAllByText(/League/i)
      .find((node) => !node.closest('[role="tab"]'));
    expect(initialDomainLabel?.textContent?.trim()).toBe("League");

    const domainTabs = screen.getByRole("tablist", {
      name: "Reminder domain",
    });
    fireEvent.click(within(domainTabs).getByRole("tab", { name: "Life" }));
    const updatedDomainLabel = within(heroSection)
      .getAllByText(/Life/i)
      .find((node) => !node.closest('[role="tab"]'));
    expect(updatedDomainLabel?.textContent?.trim()).toBe("Life");
  });

  it("shows timer hero with profile tabs", () => {
    render(<GoalsPage />);
    const timerTab = screen.getByRole("tab", { name: "Timer" });
    fireEvent.click(timerTab);
    expect(
      screen.getByRole("heading", { name: "Timer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tablist", { name: "Timer profiles" }),
    ).toBeInTheDocument();
  });

  it("handles adding goals, cap enforcement, completion toggles, and undo", async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const addButton = getGoalFormAddButton();

    // Add three goals up to the active cap
    const goalCreationPromises = [];
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(titleInput, { target: { value: `Goal ${i}` } });
      fireEvent.click(addButton);
      goalCreationPromises.push(screen.findByText(`Goal ${i}`));
    }

    await Promise.all(goalCreationPromises);

    // Attempt to add a fourth active goal, expect disabled state and help text
    fireEvent.change(titleInput, { target: { value: "Goal 4" } });
    expect(addButton).toBeDisabled();
    expect(
      screen.getByText(/Cap reached\. Finish one to add more\./),
    ).toBeInTheDocument();

    // Mark the first goal as done
    const goal1Article = screen
      .getByText("Goal 1")
      .closest("article") as HTMLElement;
    const toggleBtn = within(goal1Article).getByRole("checkbox", {
      name: "Mark done",
    });
    fireEvent.pointerDown(toggleBtn);
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      const goal1 = screen
        .getByText("Goal 1")
        .closest("article") as HTMLElement;
      expect(within(goal1).getByText("Done")).toBeInTheDocument();
    });

    // Now adding another goal should succeed
    fireEvent.change(titleInput, { target: { value: "Goal 4" } });
    await waitFor(() => expect(addButton).not.toBeDisabled());
    await waitFor(() =>
      expect(screen.getByText(/1 active slot left/)).toBeInTheDocument(),
    );
    fireEvent.click(addButton);
    const goal4 = await screen.findByText("Goal 4");
    expect(goal4).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText(/Cap reached\. Finish one to add more\./),
      ).toBeInTheDocument(),
    );

    // Remove the new goal and then undo
    const goal4Article = goal4.closest("article") as HTMLElement;
    const deleteButton = within(goal4Article).getByLabelText("Delete goal");
    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(screen.queryByText("Goal 4")).not.toBeInTheDocument(),
    );
    const undoButton = screen.getByRole("button", { name: "Undo delete goal" });
    fireEvent.click(undoButton);
    expect(await screen.findByText("Goal 4")).toBeInTheDocument();
  });

  it("resets persisted tab and filter when storage contains invalid values", async () => {
    const tabKey = createStorageKey("goals.tab.v2");
    const filterKey = createStorageKey("goals.filter.v1");
    window.localStorage.setItem(tabKey, JSON.stringify("invalid"));
    window.localStorage.setItem(filterKey, JSON.stringify("weird"));

    render(<GoalsPage />);

    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: "Goals" }),
      ).toHaveAttribute("aria-selected", "true"),
    );

    const filterTablist = screen.getByRole("tablist", { name: "Filter goals" });
    await waitFor(() =>
      expect(
        within(filterTablist).getByRole("tab", { name: "All" }),
      ).toHaveAttribute("aria-selected", "true"),
    );
  });
});
