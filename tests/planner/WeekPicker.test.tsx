import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const INITIAL_FOCUS = "2024-01-01";

vi.mock("@/components/planner/plannerSerialization", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/planner/plannerSerialization")
  >("@/components/planner/plannerSerialization");
  return {
    ...actual,
    todayISO: () => INITIAL_FOCUS,
  };
});

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T, _options?: unknown) => {
      if (key === "planner:focus") {
        return React.useState(INITIAL_FOCUS) as unknown as [
          T,
          React.Dispatch<React.SetStateAction<T>>,
        ];
      }
      return React.useState(initial);
    },
  };
});

import WeekPicker from "@/components/planner/WeekPicker";
import { PlannerProvider } from "@/components/planner";

const isoWeek = [
  "2024-01-01",
  "2024-01-02",
  "2024-01-03",
  "2024-01-04",
  "2024-01-05",
  "2024-01-06",
  "2024-01-07",
];

const renderWeekPicker = () =>
  render(
    <PlannerProvider>
      <WeekPicker />
    </PlannerProvider>,
  );

type AttachedDay = {
  element: HTMLElement;
  scrollIntoViewMock: ReturnType<typeof vi.fn>;
  focusMock: ReturnType<typeof vi.fn>;
};

const attached: HTMLElement[] = [];

const attachDayElement = (iso: string): AttachedDay => {
  const element = document.createElement("div");
  element.id = `day-${iso}`;
  element.tabIndex = -1;
  const scrollIntoViewMock = vi.fn();
  const focusMock = vi.fn();
  (element as HTMLElement & {
    scrollIntoView: (arg?: boolean | ScrollIntoViewOptions) => void;
  }).scrollIntoView = scrollIntoViewMock as unknown as (
    arg?: boolean | ScrollIntoViewOptions,
  ) => void;
  Object.defineProperty(element, "focus", {
    value: focusMock,
    configurable: true,
  });
  document.body.appendChild(element);
  attached.push(element);
  return { element, scrollIntoViewMock, focusMock };
};

const attachHeader = () => {
  const header = document.createElement("div");
  header.id = "planner-header";
  header.tabIndex = -1;
  const focusMock = vi.fn();
  Object.defineProperty(header, "focus", {
    value: focusMock,
    configurable: true,
  });
  document.body.appendChild(header);
  attached.push(header);
  return { header, focusMock };
};

describe("WeekPicker", () => {
  const originalScrollTo = window.scrollTo;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const immediateRaf: typeof window.requestAnimationFrame = (cb) => {
    cb(0);
    return 0;
  };

  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    window.requestAnimationFrame = immediateRaf;
    window.cancelAnimationFrame = vi.fn() as unknown as typeof window.cancelAnimationFrame;
  });

  afterEach(() => {
    for (const element of attached.splice(0)) {
      element.remove();
    }
    window.scrollTo = originalScrollTo;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    vi.clearAllMocks();
  });

  it("renders totals without a duplicate week range chip", () => {
    renderWeekPicker();

    expect(document.querySelector('[data-lucide="calendar-days"]')).toBeNull();

    const rangeAnnouncement = screen.getByText(/Week range/, { selector: "span" });
    expect(rangeAnnouncement).toHaveClass("sr-only");
    expect(rangeAnnouncement).toHaveAttribute("aria-live", "polite");

    const totalsLabel = screen.getByText("Total tasks:");
    const totalsBlock = totalsLabel.parentElement;
    expect(totalsBlock).not.toBeNull();
    expect(totalsBlock).toHaveClass("inline-flex");
    expect(totalsBlock).toHaveClass("items-baseline");
    expect(totalsBlock).toHaveTextContent(/Total tasks:\s*\d+\s*\/\s*\d+/);
  });

  it("renders compact chip labels with descriptive accessibility text", () => {
    renderWeekPicker();

    const options = screen.getAllByRole("option");
    const firstOption = options[0];
    const displayFormatter = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "2-digit",
    });
    const accessibleFormatter = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const targetDate = new Date(2024, 0, 1);

    const displaySpan = firstOption.querySelector(
      "[data-text] span[aria-hidden=\"true\"]",
    );
    expect(displaySpan?.textContent).toBe(displayFormatter.format(targetDate));

    const accessibleText = accessibleFormatter.format(targetDate);
    expect(firstOption).toHaveAttribute("aria-label", `Select ${accessibleText}`);
    expect(firstOption).toHaveAccessibleName(`Select ${accessibleText}`);

    const srOnlyLabel = firstOption.querySelector('[data-chip-label="full"]');
    expect(srOnlyLabel?.textContent).toBe(accessibleText);

    expect(firstOption).toHaveClass("chip-surface");
    expect(firstOption).toHaveClass("chip-border");
    expect(firstOption).toHaveClass("chip-ring");
    expect(firstOption).toHaveClass("focus-visible:outline-none");
    expect(firstOption).toHaveClass("focus-visible:ring");
    expect(firstOption).toHaveClass("focus-visible:ring-offset-0");
    expect(firstOption.className).toContain(
      "focus-visible:[--tw-ring-width:var(--ring-size-2)]",
    );
    expect(firstOption.className).toContain(
      "focus-visible:[--tw-ring-color:var(--ring-accent)]",
    );
    expect(firstOption.className).toContain("data-[focus-visible]:outline-none");
    expect(firstOption.className).toContain("data-[focus-visible]:ring");
    expect(firstOption.className).toContain(
      "data-[focus-visible]:ring-offset-0",
    );
    expect(firstOption.className).toContain(
      "data-[focus-visible]:[--tw-ring-width:var(--ring-size-2)]",
    );
    expect(firstOption.className).toContain(
      "data-[focus-visible]:[--tw-ring-color:var(--ring-accent)]",
    );
  });

  it("updates selected day on single click", () => {
    renderWeekPicker();
    const getOptions = () => screen.getAllByRole("option");
    const initial = getOptions();
    expect(initial[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.click(initial[1]);

    const updated = getOptions();
    expect(updated[1]).toHaveAttribute("aria-selected", "true");
    expect(updated[0]).toHaveAttribute("aria-selected", "false");
  });

  it("jumps to a day on double click and shows the top button", async () => {
    const { scrollIntoViewMock, focusMock } = attachDayElement(isoWeek[1]);
    renderWeekPicker();

    const options = screen.getAllByRole("option");
    fireEvent.doubleClick(options[1]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Jump to top" }),
      ).toBeInTheDocument(),
    );
  });

  it("supports keyboard navigation with arrow, home, and end keys", async () => {
    renderWeekPicker();
    const getOptions = () => screen.getAllByRole("option");
    let options = getOptions();

    options[0].focus();
    await waitFor(() => expect(options[0]).toHaveFocus());

    fireEvent.keyDown(options[0], { key: "ArrowRight" });
    options = getOptions();
    await waitFor(() => expect(options[1]).toHaveFocus());
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(options[1], { key: "ArrowRight" });
    options = getOptions();
    await waitFor(() => expect(options[2]).toHaveFocus());
    expect(options[2]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(options[2], { key: "ArrowLeft" });
    options = getOptions();
    await waitFor(() => expect(options[1]).toHaveFocus());
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(options[1], { key: "End" });
    options = getOptions();
    await waitFor(() => expect(options[6]).toHaveFocus());
    expect(options[6]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(options[6], { key: "Home" });
    options = getOptions();
    await waitFor(() => expect(options[0]).toHaveFocus());
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("keeps roving tabindex synced with the focused day", async () => {
    renderWeekPicker();
    const getOptions = () => screen.getAllByRole("option");

    let options = getOptions();
    const readTabStops = () => getOptions().map((option) => option.getAttribute("tabindex"));

    expect(readTabStops()).toEqual(["0", "-1", "-1", "-1", "-1", "-1", "-1"]);

    options[0].focus();
    await waitFor(() => expect(options[0]).toHaveFocus());

    fireEvent.keyDown(options[0], { key: "ArrowRight" });
    options = getOptions();
    await waitFor(() => expect(options[1]).toHaveFocus());
    expect(readTabStops()).toEqual(["-1", "0", "-1", "-1", "-1", "-1", "-1"]);

    fireEvent.keyDown(options[1], { key: "ArrowRight" });
    options = getOptions();
    await waitFor(() => expect(options[2]).toHaveFocus());
    expect(readTabStops()).toEqual(["-1", "-1", "0", "-1", "-1", "-1", "-1"]);
  });

  it("activates the focused day with Enter and Space", async () => {
    const { scrollIntoViewMock, focusMock } = attachDayElement(isoWeek[1]);
    renderWeekPicker();
    const getOptions = () => screen.getAllByRole("option");

    let options = getOptions();
    options[0].focus();
    await waitFor(() => expect(options[0]).toHaveFocus());

    fireEvent.keyDown(options[0], { key: "ArrowRight" });
    options = getOptions();
    await waitFor(() => expect(options[1]).toHaveFocus());

    const enterHandled = fireEvent.keyDown(options[1], { key: "Enter" });
    expect(enterHandled).toBe(false);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
    });

    await act(async () => {
      getOptions()[2].focus();
    });

    await waitFor(() => {
      const refreshed = getOptions();
      expect(refreshed[2]).toHaveFocus();
      expect(refreshed[2]).toHaveAttribute("aria-selected", "false");
    });

    const third = getOptions()[2];
    const spaceHandled = fireEvent.keyDown(third, {
      key: " ",
      code: "Space",
      keyCode: 32,
      charCode: 32,
    });
    expect(spaceHandled).toBe(true);
    fireEvent.keyUp(third, { key: " ", code: "Space", keyCode: 32, charCode: 32 });
    fireEvent.click(getOptions()[2]);

    await waitFor(() => {
      const refreshed = getOptions();
      expect(refreshed[2]).toHaveAttribute("aria-selected", "true");
    });

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  it("scrolls to top and hides the button when the top control is used", async () => {
    const { scrollIntoViewMock } = attachDayElement(isoWeek[2]);
    const { focusMock: headerFocusMock } = attachHeader();
    renderWeekPicker();

    const options = screen.getAllByRole("option");
    fireEvent.doubleClick(options[2]);
    expect(scrollIntoViewMock).toHaveBeenCalled();

    const jumpButton = await screen.findByRole("button", {
      name: "Jump to top",
    });
    const scrollToMock = window.scrollTo as unknown as ReturnType<
      typeof vi.fn
    >;
    fireEvent.click(jumpButton);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });

    await waitFor(() =>
      expect(headerFocusMock).toHaveBeenCalledWith({ preventScroll: true }),
    );

    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Jump to top" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("navigates between weeks using the header controls", async () => {
    renderWeekPicker();

    const prevButton = screen.getByRole("button", {
      name: "Go to previous week",
    });
    const todayButton = screen.getByRole("button", { name: "Jump to today" });
    const nextButton = screen.getByRole("button", { name: "Go to next week" });

    expect(todayButton).toBeDisabled();

    const getFirstLabel = () =>
      screen.getAllByRole("option")[0]?.getAttribute("aria-label") ?? "";

    const initialLabel = getFirstLabel();

    fireEvent.click(nextButton);

    await waitFor(() => expect(getFirstLabel()).not.toBe(initialLabel));
    await waitFor(() => expect(todayButton).not.toBeDisabled());

    fireEvent.click(prevButton);

    await waitFor(() => expect(getFirstLabel()).toBe(initialLabel));
    await waitFor(() => expect(todayButton).toBeDisabled());

    fireEvent.click(prevButton);

    await waitFor(() => expect(getFirstLabel()).not.toBe(initialLabel));
    await waitFor(() => expect(todayButton).not.toBeDisabled());

    fireEvent.click(todayButton);

    await waitFor(() => expect(getFirstLabel()).toBe(initialLabel));
    await waitFor(() => expect(todayButton).toBeDisabled());
  });
});
