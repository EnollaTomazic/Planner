import * as React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import {
  FocusPanel,
  PlannerProvider,
  usePlannerStore,
  todayISO,
} from "@/components/planner";
import type { DayRecord, ISODate } from "@/components/planner";

type PlannerHandle = ReturnType<typeof usePlannerStore> & {
  latestDay: DayRecord;
};

const PlannerState = React.forwardRef<PlannerHandle, { iso: ISODate }>(
  ({ iso }, ref) => {
    const planner = usePlannerStore();
    const day = planner.getDay(iso);

    React.useImperativeHandle(
      ref,
      () => ({
        ...planner,
        latestDay: day,
      }),
      [planner, day],
    );

    return null;
  },
);

PlannerState.displayName = "PlannerState";

describe("FocusPanel", () => {
  it("updates the day focus without mutating notes", async () => {
    const iso = todayISO();
    const plannerRef = React.createRef<PlannerHandle>();
    const user = userEvent.setup();

    render(
      <PlannerProvider>
        <FocusPanel iso={iso} />
        <PlannerState ref={plannerRef} iso={iso} />
      </PlannerProvider>,
    );

    expect(plannerRef.current).toBeTruthy();

    act(() => {
      plannerRef.current!.upsertDay(iso, (day) => ({
        ...day,
        notes: "Existing notes",
      }));
    });

    await waitFor(() => {
      expect(plannerRef.current!.latestDay.notes).toBe("Existing notes");
    });

    const input = screen.getByRole("textbox", { name: /daily focus/i });
    await user.clear(input);
    await user.type(input, " Deep work sprint ");

    act(() => {
      fireEvent.blur(input);
    });

    await waitFor(() => {
      const day = plannerRef.current!.latestDay;
      expect(day.focus).toBe("Deep work sprint");
      expect(day.notes).toBe("Existing notes");
    });
  });
});
