import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/planner";
let searchParamsString = "";

const scrollToHashMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

vi.mock("@/lib/scrollToHash", () => ({
  __esModule: true,
  default: scrollToHashMock,
}));

import HashScrollEffect from "@/app/HashScrollEffect";

async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("HashScrollEffect", () => {
  let scrollRoot: HTMLDivElement;
  let scrollToSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    pathname = "/planner";
    searchParamsString = "";
    window.location.hash = "";
    scrollToHashMock.mockReset();
    scrollToHashMock.mockReturnValue(true);

    scrollRoot = document.createElement("div");
    scrollRoot.id = "scroll-root";

    Object.defineProperty(scrollRoot, "scrollTop", {
      configurable: true,
      value: 0,
      writable: true,
    });

    Object.defineProperty(scrollRoot, "scrollLeft", {
      configurable: true,
      value: 0,
      writable: true,
    });

    scrollToSpy = vi.fn<
      (options?: ScrollToOptions | number, y?: number) => void
    >(function (this: HTMLDivElement, options?: ScrollToOptions | number, y?: number) {
      if (typeof options === "number") {
        this.scrollTop = typeof y === "number" ? y : options;
        return;
      }

      if (options && typeof options.top === "number") {
        this.scrollTop = options.top;
      }
    });

    Object.defineProperty(scrollRoot, "scrollTo", {
      configurable: true,
      value: scrollToSpy,
      writable: true,
    });

    document.body.appendChild(scrollRoot);

    if (typeof window.requestAnimationFrame !== "function") {
      window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
        window.setTimeout(callback, 0)) as typeof window.requestAnimationFrame;
    }

    if (typeof window.cancelAnimationFrame !== "function") {
      window.cancelAnimationFrame = ((handle: number) =>
        window.clearTimeout(handle)) as typeof window.cancelAnimationFrame;
    }
  });

  afterEach(() => {
    scrollRoot.remove();
  });

  it("restores scroll positions keyed by pathname and search params", async () => {
    searchParamsString = new URLSearchParams({ view: "list" }).toString();

    const { rerender } = render(<HashScrollEffect />);
    await flushEffects();

    scrollRoot.scrollTop = 120;
    scrollRoot.dispatchEvent(new Event("scroll"));

    searchParamsString = new URLSearchParams({ view: "board" }).toString();
    rerender(<HashScrollEffect />);
    await flushEffects();

    await waitFor(() => {
      expect(scrollRoot.scrollTop).toBe(0);
    });

    scrollRoot.scrollTop = 260;
    scrollRoot.dispatchEvent(new Event("scroll"));

    searchParamsString = new URLSearchParams({ view: "list" }).toString();
    rerender(<HashScrollEffect />);
    await flushEffects();

    await waitFor(() => {
      expect(scrollRoot.scrollTop).toBe(120);
    });
  });

  it("skips restoration when navigating with a hash and prefers smooth anchor scrolling", async () => {
    searchParamsString = new URLSearchParams({ view: "board" }).toString();

    const { rerender } = render(<HashScrollEffect />);
    await flushEffects();

    scrollRoot.scrollTop = 200;
    scrollRoot.dispatchEvent(new Event("scroll"));

    searchParamsString = new URLSearchParams({ view: "list" }).toString();
    rerender(<HashScrollEffect />);
    await flushEffects();

    await waitFor(() => {
      expect(scrollRoot.scrollTop).toBe(0);
    });

    scrollRoot.scrollTop = 40;
    scrollRoot.dispatchEvent(new Event("scroll"));

    scrollToSpy.mockClear();
    scrollToHashMock.mockClear();
    window.location.hash = "#target";

    searchParamsString = new URLSearchParams({ view: "board" }).toString();
    rerender(<HashScrollEffect />);
    await flushEffects();

    expect(scrollRoot.scrollTop).toBe(40);
    expect(scrollToSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(scrollToHashMock).toHaveBeenCalled();
    });

    const lastCall = scrollToHashMock.mock.calls.at(-1);

    expect(lastCall?.[0]).toBe("#target");
    expect(lastCall?.[1]).toMatchObject({
      behavior: "smooth",
      container: scrollRoot,
    });
  });
});
