import * as React from "react";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Page from "@/app/page";
import SiteChrome from "@/components/chrome/SiteChrome";
import { ThemeProvider } from "@/lib/theme-context";
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

      expectLink("Goals", "/goals");
      expectLink("Planner", "/planner");
      expectLink("Reviews", "/reviews");
      expectLink("Team", "/team");
      expectLink("Prompts", "/prompts");
    },
  );
});
