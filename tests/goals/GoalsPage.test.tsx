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

function getFormAddButton() {
  const submitButton = screen
    .getAllByRole("button", { name: /add goal/i })
    .find((button) => button.getAttribute("type") === "submit");
  if (!submitButton) {
    throw new Error("Expected to find the goal form submit button");
  }
  return submitButton;
}

function getMetricValue(list: HTMLElement, term: string) {
  const terms = Array.from(list.querySelectorAll("dt"));
  const target = terms.find((node) => node.textContent?.trim() === term);
  if (!target) {
    throw new Error(`Expected to find metric term: ${term}`);
  }
  const definition = target.nextElementSibling;
  if (!(definition instanceof HTMLElement)) {
    throw new Error(`Expected metric ${term} to include a value element`);
  }
  return definition.textContent?.trim() ?? "";
}

// Clean up DOM after each test
afterEach(cleanup);

describe("GoalsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders hero heading and subtitle", () => {
    render(<GoalsPage />);
    const heroRegion = screen.getByRole("region", {
      name: "Goals",
    });
    expect(
      within(heroRegion).getByRole("heading", { name: "Goals" }),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByText("Set and achieve your objectives."),
    ).toBeInTheDocument();
    expect(
      within(heroRegion).getByRole("img", {
        name: /Goals 0% complete/i,
      }),
    ).toBeInTheDocument();

    const metricsList = heroRegion.querySelector("dl");
    if (!(metricsList instanceof HTMLElement)) {
      throw new Error("Expected hero metrics list to render");
    }

    expect(getMetricValue(metricsList, "Cap")).toBe("3 active");
    expect(getMetricValue(metricsList, "Active")).toBe("0");
    expect(getMetricValue(metricsList, "Remaining")).toBe("3");
    expect(getMetricValue(metricsList, "Complete")).toBe("0 (0%)");
    expect(getMetricValue(metricsList, "Total")).toBe("0");
  });

  it("allows editing goal fields", async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const metricInput = screen.getByRole("textbox", { name: "Metric (optional)" });
    const addButton = getFormAddButton();

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

    const heroRegion = screen.getByRole("region", { name: "Goals" });
    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const addButton = getFormAddButton();

    const metricsList = heroRegion.querySelector("dl");
    if (!(metricsList instanceof HTMLElement)) {
      throw new Error("Expected hero metrics list to render");
    }

    expect(getMetricValue(metricsList, "Active")).toBe("0");
    expect(getMetricValue(metricsList, "Total")).toBe("0");

    fireEvent.change(titleInput, { target: { value: "Goal A" } });
    fireEvent.click(addButton);

    expect(getMetricValue(metricsList, "Active")).toBe("1");
    expect(getMetricValue(metricsList, "Total")).toBe("1");
  });

  it("shows domain in reminders hero and updates on change", () => {
    render(<GoalsPage />);

    const remindersTab = screen.getByRole("tab", { name: "Reminders" });
    fireEvent.click(remindersTab);

    const heroSection = screen
      .getByRole("heading", { name: "Reminders" })
      .closest("section") as HTMLElement;
    const heroDomain = within(heroSection)
      .getAllByText("League")
      .find((node) => node.closest('[role="tablist"]') === null);
    expect(heroDomain).toBeDefined();

    const domainTabs = screen.getByRole("tablist", {
      name: "Reminder domain",
    });
    fireEvent.click(within(domainTabs).getByRole("tab", { name: "Life" }));
    const updatedDomain = within(heroSection)
      .getAllByText("Life")
      .find((node) => node.closest('[role="tablist"]') === null);
    expect(updatedDomain).toBeDefined();
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
    const addButton = getFormAddButton();

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
