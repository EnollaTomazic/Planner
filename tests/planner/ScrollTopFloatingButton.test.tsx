import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ScrollTopFloatingButton from "@/components/planner/ScrollTopFloatingButton";

describe("ScrollTopFloatingButton", () => {
  beforeEach(() => {
    (window as any).IntersectionObserver = class {
      observe() {}
      disconnect() {}
    };
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
});
