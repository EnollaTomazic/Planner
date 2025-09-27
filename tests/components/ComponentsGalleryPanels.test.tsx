import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ComponentsGalleryPanels from "@/components/gallery-page/ComponentsGalleryPanels";
import type { DesignTokenGroup } from "@/components/gallery/types";
import type { GallerySerializableEntry } from "@/components/gallery/registry";

vi.mock("@/components/prompts/ComponentsView", () => ({
  default: ({ entry, ...props }: { entry: GallerySerializableEntry } & React.HTMLAttributes<HTMLElement>) => (
    <article {...props} data-testid={`gallery-entry-${entry.id}`} />
  ),
}));

describe("ComponentsGalleryPanels", () => {
  const originalMatchMedia = window.matchMedia;

  const createBaseProps = () => ({
    view: "primitives" as const,
    section: "buttons" as const,
    filteredSpecs: [
      {
        id: "badge",
        name: "Badge",
        kind: "primitive",
        preview: { id: "badge-preview" },
      },
    ] satisfies GallerySerializableEntry[],
    sectionLabel: "Buttons",
    countLabel: "1 buttons spec",
    countDescriptionId: "components-count",
    componentsPanelLabelledBy: "components-label",
    componentsPanelRef: React.createRef<HTMLDivElement>(),
    tokensPanelRef: React.createRef<HTMLDivElement>(),
    tokenGroups: [] as readonly DesignTokenGroup[],
    firstMatchId: "components-buttons-badge",
    firstMatchAnchor: "#components-buttons-badge",
    searchSubmitCount: 0,
  });

  beforeEach(() => {
    window.matchMedia = vi
      .fn(() => ({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("focuses the first match when a search is submitted", async () => {
    const baseProps = createBaseProps();
    const { rerender } = render(<ComponentsGalleryPanels {...baseProps} />);

    const target = document.getElementById("components-buttons-badge") as HTMLElement;
    expect(target).not.toBeNull();

    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView as unknown as HTMLElement["scrollIntoView"];
    const focusSpy = vi.spyOn(target, "focus");

    rerender(
      <ComponentsGalleryPanels
        {...baseProps}
        searchSubmitCount={1}
      />,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(target);
    });
    expect(focusSpy).toHaveBeenCalled();
  });

  it("uses instant scrolling when motion reduction is preferred", async () => {
    window.matchMedia = vi
      .fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

    const baseProps = createBaseProps();
    const { rerender } = render(<ComponentsGalleryPanels {...baseProps} />);

    const target = document.getElementById("components-buttons-badge") as HTMLElement;
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView as unknown as HTMLElement["scrollIntoView"];

    rerender(
      <ComponentsGalleryPanels
        {...baseProps}
        searchSubmitCount={1}
      />,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    });
  });

  it("announces the filtered result count", () => {
    const baseProps = createBaseProps();
    const { getAllByRole } = render(<ComponentsGalleryPanels {...baseProps} />);

    const statuses = getAllByRole("status");
    expect(statuses[0]).toHaveAttribute("aria-live", "polite");
    expect(statuses[0]).toHaveAttribute("aria-atomic", "true");
  });
});
