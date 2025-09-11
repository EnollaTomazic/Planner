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
vi.mock("next/navigation", () => ({
  usePathname: () => "/path",
  useRouter: () => ({ replace }),
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
  });

  it("updates hash only when value changes", () => {
    const { rerender } = render(<PageTabs tabs={tabs} value="one" />);
    expect(replace).toHaveBeenCalledWith("/path#one", { scroll: false });

    replace.mockClear();
    window.location.hash = "#one";
    rerender(<PageTabs tabs={tabs} value="one" />);
    expect(replace).not.toHaveBeenCalled();

    rerender(<PageTabs tabs={tabs} value="two" />);
    expect(replace).toHaveBeenCalledWith("/path#two", { scroll: false });
  });
});
