import * as React from "react";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ScrollTopFloatingButton from "@/components/planner/ScrollTopFloatingButton";

const originalIntersectionObserver = window.IntersectionObserver;

describe("ScrollTopFloatingButton", () => {
  let observerCallback: IntersectionObserverCallback;
  beforeEach(() => {
    const w = window as unknown as {
      IntersectionObserver: typeof IntersectionObserver;
    };
    w.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    if (originalIntersectionObserver) {
      window.IntersectionObserver = originalIntersectionObserver;
    } else {
      Reflect.deleteProperty(window, "IntersectionObserver");
    }
  });

  it("scrolls to top when clicked", () => {
    const scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    window.scrollTo = scrollTo;
    const ref = React.createRef<HTMLElement>();
    const { getByRole } = render(
      <ScrollTopFloatingButton watchRef={ref} forceVisible />,
    );
    fireEvent.click(getByRole("button", { name: "Scroll to top" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("updates visibility when watchRef.current changes", () => {
    const ref = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>;
    const first = document.createElement("div");
    const second = document.createElement("div");
    ref.current = first;
    const { rerender, queryByRole } = render(
      <ScrollTopFloatingButton watchRef={ref} />,
    );
    act(() => {
      const entry = {
        target: first,
        isIntersecting: false,
      } as unknown as IntersectionObserverEntry;
      observerCallback([entry], {} as IntersectionObserver);
    });
    expect(queryByRole("button")).not.toBeNull();
    ref.current = second;
    rerender(<ScrollTopFloatingButton watchRef={ref} />);
    act(() => {
      const entry = {
        target: second,
        isIntersecting: true,
      } as unknown as IntersectionObserverEntry;
      observerCallback([entry], {} as IntersectionObserver);
    });
    expect(queryByRole("button")).toBeNull();
    act(() => {
      const entry = {
        target: second,
        isIntersecting: false,
      } as unknown as IntersectionObserverEntry;
      observerCallback([entry], {} as IntersectionObserver);
    });
    expect(queryByRole("button")).not.toBeNull();
  });

  it("falls back gracefully when IntersectionObserver is unavailable", async () => {
    Reflect.deleteProperty(window, "IntersectionObserver");

    const ref = React.createRef<HTMLElement>();
    const { findByRole } = render(<ScrollTopFloatingButton watchRef={ref} />);

    await findByRole("button", { name: "Scroll to top" });
  });
});
