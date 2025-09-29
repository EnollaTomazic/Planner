import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(_key: string, initial: T) => React.useState(initial),
  };
});

import PlannerCreateFab from "@/components/planner/PlannerCreateFab";
import { PlannerProvider } from "@/components/planner";
import { usePlannerStore } from "@/components/planner/usePlannerStore";
import { parsePlannerPhrase } from "@/lib/scheduling";
import { toISODate } from "@/lib/date";

const originalIntersectionObserver = window.IntersectionObserver;

describe("PlannerCreateFab", () => {
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    observerCallback = () => {};
    const MockObserver = class {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        observerCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    (window as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = MockObserver;
  });

  afterEach(() => {
    cleanup();
    if (originalIntersectionObserver) {
      window.IntersectionObserver = originalIntersectionObserver;
    } else {
      Reflect.deleteProperty(window, "IntersectionObserver");
    }
  });

  it("toggles visibility based on intersection", () => {
    const ref = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>;
    ref.current = document.createElement("div");
    document.body.appendChild(ref.current);

    const { queryByRole } = render(
      <PlannerProvider>
        <PlannerCreateFab watchRef={ref} />
      </PlannerProvider>,
    );

    act(() => {
      observerCallback(
        [
          {
            target: ref.current!,
            isIntersecting: false,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(queryByRole("button", { name: "Create planner item" })).not.toBeNull();

    act(() => {
      observerCallback(
        [
          {
            target: ref.current!,
            isIntersecting: true,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(queryByRole("button", { name: "Create planner item" })).toBeNull();
  });

  it("creates a task from a parsed phrase", async () => {
    const ref = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>;
    ref.current = document.createElement("div");

    const storeRef: { current: ReturnType<typeof usePlannerStore> | null } = {
      current: null,
    };

    function StoreObserver() {
      const store = usePlannerStore();
      React.useEffect(() => {
        storeRef.current = store;
      });
      return null;
    }

    render(
      <PlannerProvider>
        <StoreObserver />
        <PlannerCreateFab watchRef={ref} forceVisible />
      </PlannerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create planner item" }));

    fireEvent.change(screen.getByLabelText("Plan details"), {
      target: { value: "Daily standup tomorrow at 9am" },
    });

    await waitFor(() => {
      const projectField = screen.getByLabelText("Project name");
      expect((projectField as HTMLInputElement).value).toBe("standup");
    });

    const referenceDate = new Date();
    const fallbackISO = toISODate(referenceDate);
    const parsed =
      parsePlannerPhrase("Daily standup tomorrow at 9am", {
        referenceDate,
        fallbackISO,
      }) ?? {
        occurrences: [fallbackISO],
      };
    const tomorrow = parsed.occurrences[0] ?? fallbackISO;

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    const store = storeRef.current;
    expect(store).not.toBeNull();

    await waitFor(() => {
      const dayRecord = storeRef.current?.getDay(tomorrow);
      expect(dayRecord?.projects).toHaveLength(1);
      expect(dayRecord?.tasks).toHaveLength(1);
    });

    const dayRecord = store?.getDay(tomorrow);
    expect(dayRecord?.projects[0]?.name).toBe("standup");
    expect(dayRecord?.tasks[0]?.title).toBe("standup");

    expect(screen.getByText(/Added 1 task from the planner sheet\./i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("applies recurring templates to multiple days", async () => {
    const ref = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>;
    ref.current = document.createElement("div");

    const storeRef: { current: ReturnType<typeof usePlannerStore> | null } = {
      current: null,
    };

    function StoreObserver() {
      const store = usePlannerStore();
      React.useEffect(() => {
        storeRef.current = store;
      });
      return null;
    }

    render(
      <PlannerProvider>
        <StoreObserver />
        <PlannerCreateFab watchRef={ref} forceVisible />
      </PlannerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create planner item" }));
    fireEvent.change(screen.getByLabelText("Plan details"), {
      target: { value: "Standup every weekday at 9am" },
    });

    const templateButton = await screen.findByRole("button", { name: "Next three" });
    fireEvent.click(templateButton);

    const referenceDate = new Date();
    const fallbackISO = toISODate(referenceDate);
    const parsed =
      parsePlannerPhrase("Standup every weekday at 9am", {
        referenceDate,
        fallbackISO,
      }) ?? { occurrences: [fallbackISO] };
    const expectedDays = parsed.occurrences.slice(0, 3);

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    const store = storeRef.current;
    expect(store).not.toBeNull();

    await waitFor(() => {
      for (const iso of expectedDays) {
        const record = storeRef.current?.getDay(iso);
        expect(record?.tasks).toHaveLength(1);
      }
    });

    for (const iso of expectedDays) {
      const record = store?.getDay(iso);
      expect(record?.tasks?.[0]?.title).toBe("Standup");
    }

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
