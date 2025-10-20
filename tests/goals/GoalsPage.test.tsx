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

describe("GoalsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders hero heading and subtitle", () => {
    render(<GoalsPage />);
    const heroRegion = screen.getByRole("region", {
      name: "Goals overview",
    });
    expect(
      within(heroRegion).getByRole("heading", { name: "Goals overview" }),
    ).toBeInTheDocument();
    const heroSummary = within(heroRegion).getByText((_, node) => {
      if (!(node instanceof HTMLElement)) {
        return false;
      }
      return node.id === "goals-hero-summary";
    });
    const capSegment = within(heroSummary)
      .getByText("Cap", { selector: "span" })
      .parentElement as HTMLElement;
    const activeSegment = within(heroSummary)
      .getByText("Active", { selector: "span" })
      .parentElement as HTMLElement;
    const remainingSegment = within(heroSummary)
      .getByText("Remaining", { selector: "span" })
      .parentElement as HTMLElement;
    const doneSegment = within(heroSummary)
      .getByText("Done", { selector: "span" })
      .parentElement as HTMLElement;

    expect(capSegment).toHaveTextContent(/Cap\s*3/);
    expect(activeSegment).toHaveTextContent(/Active\s*0/);
    expect(remainingSegment).toHaveTextContent(/Remaining\s*3/);
    expect(doneSegment).toHaveTextContent(/Done\s*0\s*\(0%\)/);
  });

  it("allows editing goal fields", async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const metricInput = screen.getByRole("textbox", { name: "Metric (optional)" });
    const addButton = screen.getByRole("button", { name: /add goal/i });

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

  it("renders dynamic subtitle with counts", () => {
    render(<GoalsPage />);
    const headerHeading = screen.getByRole("heading", {
      name: "Today’s Goals",
    });
    const summaryList = headerHeading.parentElement?.querySelector(
      ":scope > span ul",
    );
    if (!(summaryList instanceof HTMLElement)) {
      throw new Error("Expected header summary list to render");
    }
    const items = within(summaryList).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent(/Cap\s*3\s*active/);
    expect(items[1]).toHaveTextContent(/Remaining\s*3/);
    expect(items[2]).toHaveTextContent(/Complete\s*0%/);
    expect(items[3]).toHaveTextContent(/Total\s*0/);
  });

  it("shows domain in reminders hero and updates on change", () => {
    render(<GoalsPage />);

    const remindersTab = screen.getByRole("tab", { name: "Reminders" });
    fireEvent.click(remindersTab);

    const heroSection = screen
      .getByRole("heading", { name: "Reminders" })
      .closest("section") as HTMLElement;
    expect(
      within(heroSection).getByText("League", { selector: "div" }),
    ).toBeInTheDocument();

    const domainTabs = screen.getByRole("tablist", {
      name: "Reminder domain",
    });
    fireEvent.click(within(domainTabs).getByRole("tab", { name: "Life" }));
    expect(
      within(heroSection).getByText("Life", { selector: "div" }),
    ).toBeInTheDocument();
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
    const addButton = screen.getByRole("button", { name: /add goal/i });

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
