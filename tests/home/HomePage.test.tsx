import * as React from "react";
import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Page from "@/app/page";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { ThemeProvider } from "@/lib/theme-context";
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
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Home page", () => {
  it(
    "renders navigation links",
    {
      timeout: 15000,
    },
    () => {
      render(
        <ThemeProvider>
          <SiteChrome>
            <Suspense fallback="loading">
              <Page />
            </Suspense>
          </SiteChrome>
        </ThemeProvider>,
      );
      const expectLink = (label: string, href: string) => {
        const match = (screen
          .getAllByRole("link", { name: label }) as HTMLAnchorElement[])
          .find((anchor) => anchor.getAttribute("href") === href);
        expect(match?.getAttribute("href")).toBe(href);
      };

      expectLink("Goals", "/goals/");
      expectLink("Planner", "/planner/");
      expectLink("Reviews", "/reviews/");
      expectLink("Team", "/team/");
      expectLink("Prompts", "/prompts/");
    },
  );

  it("renders a single main landmark", () => {
    const { container } = render(
      <ThemeProvider>
        <main id="main-content">
          <Suspense fallback="loading">
            <Page />
          </Suspense>
        </main>
      </ThemeProvider>,
    );

    const landmarks = container.querySelectorAll("main, [role=\"main\"]");
    expect(landmarks).toHaveLength(1);
  });

  it("enables the glitch landing experience when the flag is set", async () => {
    const { container } = render(
      <ThemeProvider glitchLandingEnabled>
        <SiteChrome>
          <Suspense fallback="loading">
            <Page />
          </Suspense>
        </SiteChrome>
      </ThemeProvider>,
    );

    expect(
      await screen.findByRole("status", { name: "Planner is loading" }),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-state="splash"]')).not.toBeNull();

    await waitFor(() => {
      expect(document.body.dataset.glitchLanding).toBe("enabled");
    });
  });

  it("falls back to the legacy landing experience when the flag is disabled", async () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    try {
      render(
        <ThemeProvider glitchLandingEnabled={false}>
          <main id="main-content">
            <Suspense fallback="loading">
              <Page />
            </Suspense>
          </main>
        </ThemeProvider>,
      );

      expect(
        (await screen.findAllByRole("region", { name: "Planner overview" })).length,
      ).toBeGreaterThan(0);
      expect(document.body.dataset.glitchLanding).toBe("legacy");
      const homeContent = document.querySelector("[data-home-content]");
      expect(homeContent).not.toBeNull();
      expect(homeContent).toHaveAttribute("data-state", "ready");
      expect(
        screen.queryByRole("status", { name: "Planner is loading" }),
      ).toBeNull();
      expect(
        setTimeoutSpy.mock.calls.some(([, delay]) => delay === 400),
      ).toBe(false);
    } finally {
      setTimeoutSpy.mockRestore();
    }
  });
});
