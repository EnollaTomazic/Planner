import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useDebouncedCallback from "@/lib/useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("resets the timer when called repeatedly", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));
    const [debounced] = result.current;

    act(() => {
      debounced("first");
      vi.advanceTimersByTime(50);
      debounced("second");
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(99);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("cancels scheduled execution", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));
    const [debounced, cancel] = result.current;

    act(() => {
      debounced();
    });

    act(() => {
      cancel();
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("invokes immediately when delay is non-positive", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 0));
    const [debounced] = result.current;

    act(() => {
      debounced("value");
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("value");
  });

  it("clears pending timers on unmount", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current[0]("value");
    });

    unmount();

    act(() => {
      vi.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("clears pending timers when delay changes", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      { initialProps: { delay: 100 } },
    );

    act(() => {
      result.current[0]("first");
    });

    rerender({ delay: 200 });

    act(() => {
      vi.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current[0]("second");
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });
});
