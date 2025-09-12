import * as React from "react";
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

// Clean up DOM after each test
afterEach(cleanup);

describe("GoalsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders hero heading and subtitle", () => {
    render(<GoalsPage />);
    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cap 3, 3 remaining (0 active, 0 done)"),
    ).toBeInTheDocument();
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
    expect(
      screen.getByText("Cap 3, 3 remaining (0 active, 0 done)"),
    ).toBeInTheDocument();
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
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(titleInput, { target: { value: `Goal ${i}` } });
      fireEvent.click(addButton);
      // ensure each goal appears
      // eslint-disable-next-line no-await-in-loop
      await screen.findByText(`Goal ${i}`);
    }

    // Attempt to add a fourth active goal, expect cap error
    fireEvent.change(titleInput, { target: { value: "Goal 4" } });
    fireEvent.click(addButton);
    expect(screen.getByRole("status")).toHaveTextContent("Cap reached");

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
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    const goal4 = await screen.findByText("Goal 4");
    expect(goal4).toBeInTheDocument();

    // Remove the new goal and then undo
    const goal4Article = goal4.closest("article") as HTMLElement;
    const deleteButton = within(goal4Article).getByLabelText("Delete goal");
    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(screen.queryByText("Goal 4")).not.toBeInTheDocument(),
    );
    const undoButton = screen.getByRole("button", { name: "Undo" });
    fireEvent.click(undoButton);
    expect(await screen.findByText("Goal 4")).toBeInTheDocument();
  });
});
