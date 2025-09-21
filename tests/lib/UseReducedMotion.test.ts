import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";

import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type ChangeListener = (event: MediaQueryListEvent) => void;

type MatchMediaController = {
  emitChange: (matches: boolean) => void;
  addEventListener: Mock<
    (event: string, listener: EventListenerOrEventListenerObject) => void
  >;
};

const originalMatchMedia = window.matchMedia;

function setupMatchMedia(matches: boolean): MatchMediaController {
  const listeners = new Set<ChangeListener>();

  const addEventListener = vi.fn<
    (event: string, listener: EventListenerOrEventListenerObject) => void
  >((event, listener) => {
    if (event !== "change") {
      return;
    }

    if (typeof listener === "function") {
      listeners.add(listener as ChangeListener);
      return;
    }

    if (typeof listener === "object" && listener && "handleEvent" in listener) {
      const handler = listener.handleEvent as EventListener;
      listeners.add(handler as unknown as ChangeListener);
    }
  });

  const removeEventListener = vi.fn<
    (event: string, listener: EventListenerOrEventListenerObject) => void
  >((event, listener) => {
    if (event !== "change") {
      return;
    }

    if (typeof listener === "function") {
      listeners.delete(listener as ChangeListener);
      return;
    }

    if (typeof listener === "object" && listener && "handleEvent" in listener) {
      const handler = listener.handleEvent as EventListener;
      listeners.delete(handler as unknown as ChangeListener);
    }
  });

  const mediaQueryListObject = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: addEventListener as unknown as MediaQueryList["addEventListener"],
    removeEventListener:
      removeEventListener as unknown as MediaQueryList["removeEventListener"],
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies Record<string, unknown>;

  const matchMediaMock = vi.fn((query: string) =>
    mediaQueryListObject as unknown as MediaQueryList
  );
  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

  return {
    addEventListener,
    emitChange(nextMatches: boolean) {
      mediaQueryListObject.matches = nextMatches;

      listeners.forEach((listener) => {
        listener({ matches: nextMatches } as MediaQueryListEvent);
      });
    },
  };
}

describe("UseReducedMotion", () => {
  it("returns the current media query value on first render", () => {
    const controller = setupMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(typeof result.current).toBe("boolean");
    expect(result.current).toBe(true);
    expect(controller.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("updates when the media query value changes", () => {
    const controller = setupMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      controller.emitChange(true);
    });

    expect(result.current).toBe(true);

    act(() => {
      controller.emitChange(false);
    });

    expect(result.current).toBe(false);
  });
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;

  if ("mockClear" in originalMatchMedia) {
    (
      originalMatchMedia as Mock<(query: string) => MediaQueryList>
    ).mockClear();
  }
});
