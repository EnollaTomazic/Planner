import * as React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => true };
});

let replace: ReturnType<typeof vi.fn>;
let mockSearchParams: URLSearchParams;
vi.mock("next/navigation", () => ({
  usePathname: () => "/path",
  useRouter: () => ({ replace }),
  useSearchParams: () => mockSearchParams,
}));

import PageTabs from "@/components/chrome/PageTabs";

describe("PageTabs", () => {
  const tabs = [
    { id: "one", label: "One" },
    { id: "two", label: "Two" },
  ];

  beforeEach(() => {
    replace = vi.fn();
    window.location.hash = "";
    mockSearchParams = new URLSearchParams();
  });

  it("updates hash only when value changes", () => {
    const { rerender } = render(
      <PageTabs tabs={tabs} value="one" ariaLabel="Planner sections" />,
    );
    expect(replace).toHaveBeenCalledWith("/path#one", { scroll: false });

    replace.mockClear();
    window.location.hash = "#one";
    rerender(
      <PageTabs tabs={tabs} value="one" ariaLabel="Planner sections" />,
    );
    expect(replace).not.toHaveBeenCalled();

    rerender(
      <PageTabs tabs={tabs} value="two" ariaLabel="Planner sections" />,
    );
    expect(replace).toHaveBeenCalledWith("/path#two", { scroll: false });
  });

  it("preserves the query string when updating the hash", () => {
    mockSearchParams = new URLSearchParams("foo=bar&baz=qux");
    const { rerender } = render(
      <PageTabs tabs={tabs} value="one" ariaLabel="Planner sections" />,
    );
    expect(replace).toHaveBeenCalledWith("/path?foo=bar&baz=qux#one", {
      scroll: false,
    });

    replace.mockClear();
    window.location.hash = "#one";
    rerender(
      <PageTabs tabs={tabs} value="one" ariaLabel="Planner sections" />,
    );
    expect(replace).not.toHaveBeenCalled();

    rerender(
      <PageTabs tabs={tabs} value="two" ariaLabel="Planner sections" />,
    );
    expect(replace).toHaveBeenCalledWith("/path?foo=bar&baz=qux#two", {
      scroll: false,
    });
  });

  it("pins sticky tabs using scoped custom properties", () => {
    const topOffset = "calc(var(--header-stack) + var(--space-2))";
    const { container } = render(
      <PageTabs
        tabs={tabs}
        value="one"
        ariaLabel="Planner sections"
        topOffset={topOffset}
      />,
    );

    const wrapper = container.querySelector('[data-sticky="true"]');
    expect(wrapper).not.toBeNull();

    const stickyElement = wrapper as HTMLElement;
    expect(stickyElement.style.getPropertyValue("--page-tabs-top")).toBe(
      topOffset,
    );
    expect(stickyElement.style.getPropertyValue("top")).toBe("");
  });

  it("leaves non-sticky tabs unaffected", () => {
    const { container } = render(
      <PageTabs
        tabs={tabs}
        value="one"
        ariaLabel="Planner sections"
        sticky={false}
      />,
    );

    expect(container.querySelector("[data-sticky]")).toBeNull();
  });
});
