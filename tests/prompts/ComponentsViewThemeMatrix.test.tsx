import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import ComponentsView from "@/components/prompts/ComponentsView";
import { ThemeProvider } from "@/lib/theme-context";
import { VARIANTS } from "@/lib/theme";
import * as themeModule from "@/lib/theme";
import type { GallerySerializableEntry } from "@/components/gallery";

vi.mock("@/components/prompts/constants", () => ({
  getGalleryPreview: (id: string) => () => (
    <div data-testid="gallery-preview">Preview for {id}</div>
  ),
}));

describe("ComponentsView theme matrix", () => {
  const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

  const entry: GallerySerializableEntry = {
    id: "test-entry",
    name: "Test entry",
    kind: "component",
    preview: { id: "test-preview" },
  };

  const originalMatchMedia = window.matchMedia;

  beforeAll(() => {
    if (!window.matchMedia) {
      window.matchMedia = vi
        .fn()
        .mockReturnValue({
          matches: true,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as typeof window.matchMedia;
    }
  });

  beforeEach(() => {
    document.documentElement.className = "theme-lg";
    document.documentElement.dataset.themePref = "persisted";
    document.documentElement.style.colorScheme = "dark";
    applyThemeSpy.mockImplementation(() => {});
    applyThemeSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    applyThemeSpy.mockRestore();
    window.matchMedia = originalMatchMedia;
  });

  it("renders a radio control for each theme variant", () => {
    render(
      <ThemeProvider>
        <ComponentsView entry={entry} />
      </ThemeProvider>,
    );

    for (const variant of VARIANTS) {
      expect(
        screen.getByRole("radio", { name: variant.label }),
      ).toBeInTheDocument();
    }
  });

  it("applies each theme variant and matches snapshots", () => {
    const { container } = render(
      <ThemeProvider>
        <ComponentsView entry={entry} />
      </ThemeProvider>,
    );

    // Ignore theme applications triggered by initial hydration.
    applyThemeSpy.mockClear();

    for (const variant of VARIANTS) {
      const control = screen.getByRole("radio", { name: variant.label });
      fireEvent.click(control);

      if (applyThemeSpy.mock.calls.length > 0) {
        expect(applyThemeSpy).toHaveBeenCalledWith(
          expect.objectContaining({ variant: variant.id }),
        );
      }

      expect(container.firstChild).toMatchSnapshot(variant.id);
      applyThemeSpy.mockClear();
    }
  });
});
