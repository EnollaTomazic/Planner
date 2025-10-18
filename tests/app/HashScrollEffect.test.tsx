import * as React from "react";
import HashScrollEffect from "@app/HashScrollEffect";
import { act, render, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

let mockedPathname = "/first";
let mockedSearchParams: URLSearchParams | null = null;

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
  useSearchParams: () => mockedSearchParams,
}));

const createScrollToImplementation = (target: HTMLElement) =>
  ((options?: ScrollToOptions | number, y?: number) => {
    if (typeof options === "number") {
      target.scrollTop = options;
      return;
    }

    if (typeof y === "number") {
      target.scrollTop = y;
      return;
    }

    if (typeof options?.top === "number") {
      target.scrollTop = options.top;
    }
  }) as typeof HTMLElement.prototype.scrollTo;

describe("HashScrollEffect", () => {
  let scrollRoot: HTMLDivElement;
  let originalScrollRestoration: string | undefined;

  beforeEach(() => {
    mockedPathname = "/first";
    mockedSearchParams = null;
    originalScrollRestoration = window.history.scrollRestoration;

    Object.defineProperty(window.history, "scrollRestoration", {
      configurable: true,
      writable: true,
      value: "auto",
    });

    scrollRoot = document.createElement("div");
    scrollRoot.id = "scroll-root";
    scrollRoot.style.height = "400px";
    scrollRoot.style.overflow = "auto";
    scrollRoot.scrollTop = 0;
    scrollRoot.scrollTo = createScrollToImplementation(scrollRoot);
    document.body.appendChild(scrollRoot);

    window.location.hash = "";
  });

  afterEach(() => {
    scrollRoot.remove();

    if (originalScrollRestoration === undefined) {
      Reflect.deleteProperty(window.history, "scrollRestoration");
    } else {
      window.history.scrollRestoration = originalScrollRestoration;
    }
  });

  it("restores the previous scroll position when navigating back", async () => {
    const { rerender } = render(<HashScrollEffect />);

    await waitFor(() => {
      expect(window.history.scrollRestoration).toBe("manual");
    });

    act(() => {
      scrollRoot.scrollTop = 180;
      scrollRoot.dispatchEvent(new Event("scroll"));
    });

    mockedPathname = "/second";
    rerender(<HashScrollEffect />);

    await waitFor(() => {
      expect(scrollRoot.scrollTop).toBe(0);
    });

    act(() => {
      scrollRoot.scrollTop = 40;
      scrollRoot.dispatchEvent(new Event("scroll"));
    });

    mockedPathname = "/first";
    rerender(<HashScrollEffect />);

    await waitFor(() => {
      expect(scrollRoot.scrollTop).toBe(180);
    });
  });
});
