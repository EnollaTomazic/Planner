import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/db", async () => {
  const actual: any = await vi.importActual("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T) => React.useState(initial),
  };
});

import { PlannerProvider, useFocusDate, useWeek } from "@/components/planner";

describe("useFocusDate", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlannerProvider>{children}</PlannerProvider>
  );

  it("tracks and updates focus date", () => {
    const { result } = renderHook(() => useFocusDate(), { wrapper });
    act(() => result.current.setIso("2030-01-01"));
    expect(result.current.iso).toBe("2030-01-01");
  });

  it("derives week information", () => {
    const { result } = renderHook(() => useWeek("2030-01-01"), { wrapper });
    expect(result.current.days).toHaveLength(7);
    expect(result.current.isToday("2030-01-01")).toBe(false);
  });
});
