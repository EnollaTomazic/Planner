import React, { Suspense } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

import HomePage from "@/app/page";
import PlannerPage from "@/app/planner/page";
import GoalsPage from "@/app/goals/page";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { ThemeProvider } from "@/lib/theme-context";
import { flushWriteLocal } from "@/lib/db";

vi.mock("@/components/gallery/manifest", () => ({
  __esModule: true,
  manifest: {
    galleryPayload: { sections: [] },
    galleryPreviewModules: {},
    galleryPreviewRoutes: [],
  },
  galleryPayload: { sections: [] },
  galleryPreviewModules: {},
  galleryPreviewRoutes: [],
}));

let mockPathname = "/";
let prefersDark = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

type ThemeProps = Partial<React.ComponentProps<typeof ThemeProvider>>;

function renderWithChrome(page: React.ReactElement, themeProps?: ThemeProps) {
  return render(
    <ThemeProvider {...themeProps}>
      <SiteChrome>
        <Suspense fallback="loading">{page}</Suspense>
      </SiteChrome>
    </ThemeProvider>,
  );
}

function setMatchMedia(prefersDarkMedia: boolean) {
  prefersDark = prefersDarkMedia;
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Page shells", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.className = "";
    document.documentElement.dataset.themePref = "system";
    setMatchMedia(false);
  });

  it("persists theme selections across pages while keeping landmarks intact", async () => {
    const user = userEvent.setup();
    mockPathname = "/";
    const { rerender } = renderWithChrome(<HomePage />, {
      glitchLandingEnabled: false,
    });

    const banners = await screen.findAllByRole("banner", undefined, {
      timeout: 5000,
    });
    expect(banners.length).toBeGreaterThan(0);

    const cycleButton = await screen.findByLabelText(/theme: cycle background/i);
    await waitFor(() => expect(cycleButton).toBeEnabled());
    await user.click(cycleButton);
    act(() => {
      flushWriteLocal();
    });

    await waitFor(() =>
      expect(document.documentElement.classList.contains("bg-alt1")).toBe(true),
    );
    expect(document.documentElement.dataset.themePref).toBe("persisted");
    mockPathname = "/planner/";
    rerender(
      <ThemeProvider>
        <SiteChrome>
          <Suspense fallback="loading">
            <PlannerPage />
          </Suspense>
        </SiteChrome>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(document.documentElement.classList.contains("bg-alt1")).toBe(true),
    );
    await waitFor(
      () => {
        const mains = screen.getAllByRole("main");
        expect(mains[0]).toHaveAttribute("id", "page-main");
      },
      { timeout: 10000 },
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "page-main");
  });

  it("maintains keyboard tab order and focus indicators in light and dark themes", async () => {
    const user = userEvent.setup();
    mockPathname = "/goals/";
    renderWithChrome(<GoalsPage />);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(false),
    );

    const tablist = await screen.findByRole("tablist", { name: "Goals header mode" });
    const goalsTab = within(tablist).getByRole("tab", { name: "Goals" });
    const remindersTab = within(tablist).getByRole("tab", { name: "Reminders" });
    const timerTab = within(tablist).getByRole("tab", { name: "Timer" });

    goalsTab.focus();
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(remindersTab).toHaveAttribute(
      "aria-controls",
      "goals-tabs-reminders-panel",
    );
    const tabpanels = await screen.findAllByRole("tabpanel", { hidden: true });
    expect(tabpanels.length).toBeGreaterThan(0);
    const remindersPanel = tabpanels.find(
      (panel) => panel.getAttribute("aria-labelledby") === remindersTab.id,
    );
    expect(remindersPanel).toBeTruthy();

    const themeCycle = await screen.findByLabelText(/theme: cycle background/i);
    await waitFor(() => expect(themeCycle).toBeEnabled());
    setMatchMedia(true);
    await user.click(themeCycle);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
  });
});
