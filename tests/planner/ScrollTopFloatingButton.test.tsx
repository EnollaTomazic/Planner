import * as React from "react";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ScrollTopFloatingButton from "@/components/planner/ScrollTopFloatingButton";

describe("ScrollTopFloatingButton", () => {
  let observerCallback: (entries: any[]) => void;
  beforeEach(() => {
    (window as any).IntersectionObserver = class {
      constructor(cb: any) {
        observerCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("scrolls to top when clicked", () => {
    const scrollTo = vi.fn();
    (window as any).scrollTo = scrollTo;
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
      observerCallback([{ target: first, isIntersecting: false }]);
    });
    expect(queryByRole("button")).not.toBeNull();
    ref.current = second;
    rerender(<ScrollTopFloatingButton watchRef={ref} />);
    act(() => {
      observerCallback([{ target: second, isIntersecting: true }]);
    });
    expect(queryByRole("button")).toBeNull();
    act(() => {
      observerCallback([{ target: second, isIntersecting: false }]);
    });
    expect(queryByRole("button")).not.toBeNull();
  });
});
