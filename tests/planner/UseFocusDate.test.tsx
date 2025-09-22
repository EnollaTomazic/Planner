import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(_key: string, initial: T, _options?: unknown) =>
      React.useState(initial),
  };
});

import { PlannerProvider, useFocusDate, useWeek } from "@/components/planner";
import { toISODate } from "@/lib/date";

describe("UseFocusDate", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlannerProvider>{children}</PlannerProvider>
  );

  it("tracks and updates focus date", () => {
    const { result } = renderHook(() => useFocusDate(), { wrapper });
    act(() => result.current.setIso("2030-01-01"));
    expect(result.current.iso).toBe("2030-01-01");
  });

  it("uses today's ISO while the persisted focus is unresolved", () => {
    vi.useFakeTimers();
    const now = new Date(2030, 0, 5, 9, 30, 0);
    vi.setSystemTime(now);

    const { result, unmount } = renderHook(() => useFocusDate(), { wrapper });

    try {
      const expected = toISODate(now);
      expect(result.current.today).toBe(expected);
      expect(result.current.iso).toBe(expected);
    } finally {
      unmount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("updates focus when the local day rolls over", () => {
    vi.useFakeTimers();
    const initial = new Date(2024, 5, 1, 12, 0, 0);
    vi.setSystemTime(initial);

    const { result, unmount } = renderHook(() => useFocusDate(), { wrapper });
    const next = new Date(initial);
    next.setDate(initial.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    const delay = next.getTime() - initial.getTime();
    try {
      act(() => {
        vi.advanceTimersByTime(delay + 10);
      });

      const expected = toISODate(next);
      expect(result.current.today).toBe(expected);
      expect(result.current.iso).toBe(expected);
    } finally {
      unmount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("clears the midnight timer on unmount", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 1, 12, 0, 0));

    const before = vi.getTimerCount();
    const { unmount } = renderHook(() => useFocusDate(), { wrapper });
    let afterUnmount: number | null = null;
    try {
      expect(vi.getTimerCount()).toBeGreaterThan(before);
    } finally {
      unmount();
      afterUnmount = vi.getTimerCount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }

    expect(afterUnmount).toBe(before);
  });

  it("derives week information", () => {
    const { result } = renderHook(() => useWeek("2030-01-01"), { wrapper });
    expect(result.current.days).toHaveLength(7);
    expect(result.current.isToday("2030-01-01")).toBe(false);
  });
});
