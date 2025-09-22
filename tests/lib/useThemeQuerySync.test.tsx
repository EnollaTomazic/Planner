import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import { resetLocalStorage } from "../setup";

const replaceSpy = vi.fn<(url: string, options?: { scroll: boolean }) => void>();
let pathname = "/planner";
let searchParamsString = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceSpy,
  }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function renderThemeSync() {
  return renderHook(() => {
    useThemeQuerySync();
    return useTheme();
  }, { wrapper: Wrapper });
}

describe("useThemeQuerySync", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    searchParamsString = "";
    pathname = "/planner";
    replaceSpy.mockClear();
    resetLocalStorage();
    window.location.hash = "";
  });

  it("applies valid theme and background query params", async () => {
    searchParamsString = new URLSearchParams({ theme: "ocean", bg: "3" }).toString();

    const { result } = renderThemeSync();

    await waitFor(() => {
      const [theme] = result.current;
      expect(theme.variant).toBe("ocean");
      expect(theme.bg).toBe(3);
    });
  });

  it("ignores invalid query params", async () => {
    searchParamsString = new URLSearchParams({ theme: "unknown", bg: "99" }).toString();

    const { result } = renderThemeSync();

    await waitFor(() => {
      const [theme] = result.current;
      expect(theme.variant).toBe("lg");
      expect(theme.bg).toBe(0);
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalledWith("/planner?theme=lg&bg=0", {
        scroll: false,
      });
    });
  });

  it("updates the URL when the theme changes without looping", async () => {
    searchParamsString = new URLSearchParams({ theme: "lg", bg: "0" }).toString();

    const { result, rerender } = renderThemeSync();

    await waitFor(() => {
      const [theme] = result.current;
      expect(theme.variant).toBe("lg");
      expect(theme.bg).toBe(0);
    });

    act(() => {
      const [, setTheme] = result.current;
      setTheme((prev) => ({ ...prev, variant: "noir", bg: 2 }));
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalledWith("/planner?theme=noir&bg=2", {
        scroll: false,
      });
    });

    expect(replaceSpy).toHaveBeenCalledTimes(1);

    searchParamsString = new URLSearchParams({ theme: "noir", bg: "2" }).toString();

    act(() => {
      rerender();
    });

    await waitFor(() => {
      const [theme] = result.current;
      expect(theme.variant).toBe("noir");
      expect(theme.bg).toBe(2);
    });

    expect(replaceSpy).toHaveBeenCalledTimes(1);
  });

  it("preserves the current hash fragment when toggling the theme", async () => {
    searchParamsString = new URLSearchParams({ theme: "lg", bg: "0" }).toString();
    window.location.hash = "#section-42";

    const { result } = renderThemeSync();

    await waitFor(() => {
      const [theme] = result.current;
      expect(theme.variant).toBe("lg");
      expect(theme.bg).toBe(0);
    });

    act(() => {
      const [, setTheme] = result.current;
      setTheme((prev) => ({ ...prev, variant: "ocean", bg: 1 }));
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalledWith("/planner?theme=ocean&bg=1#section-42", {
        scroll: false,
      });
    });
  });
});
