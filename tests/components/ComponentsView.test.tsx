import * as React from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/lib/theme-context";

vi.mock("@/components/prompts/constants", () => ({
  getGalleryPreview: () => () => <div data-testid="preview" />,
}));

import {
  PROPS_DISCLOSURE_COLLAPSE_THRESHOLD, ComponentsView } from "@/components/prompts/ComponentsView";
import type { GallerySerializableEntry } from "@/components/gallery";

type GalleryProp = NonNullable<GallerySerializableEntry["props"]>[number];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function createProp(index: number, overrides: Partial<GalleryProp> = {}): GalleryProp {
  const name = overrides.name ?? `prop-${index}`;
  return {
    name,
    type: overrides.type ?? "string",
    required: overrides.required,
    defaultValue: overrides.defaultValue,
    description: overrides.description,
  };
}

function createEntry(
  overrides: Partial<GallerySerializableEntry> = {},
): GallerySerializableEntry {
  return {
    id: "component-entry",
    name: "Component entry",
    kind: "component",
    preview: { id: "component-preview" },
    props: overrides.props ?? [],
    axes: overrides.axes,
    usage: overrides.usage,
    related: overrides.related,
    code: overrides.code,
    states: overrides.states,
    description: overrides.description,
    tags: overrides.tags,
  } satisfies GallerySerializableEntry;
}

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe("ComponentsView props disclosure", () => {
  it("collapses the props table by default when the prop count exceeds the threshold", () => {
    const propCount = PROPS_DISCLOSURE_COLLAPSE_THRESHOLD + 6;
    const entry = createEntry({
      props: Array.from({ length: propCount }, (_, index) => createProp(index + 1)),
    });

    renderWithTheme(<ComponentsView entry={entry} />);

    const toggle = screen.getByRole("button", {
      name: `View ${propCount} props`,
    });

    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const panelId = toggle.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = panelId ? document.getElementById(panelId) : null;
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("role", "region");

    expect(screen.queryByRole("table")).toBeNull();
  });

  it("expands the props table on toggle and focuses the first prop cell", async () => {
    const propCount = PROPS_DISCLOSURE_COLLAPSE_THRESHOLD + 1;
    const entry = createEntry({
      props: Array.from({ length: propCount }, (_, index) => createProp(index + 1)),
    });

    renderWithTheme(<ComponentsView entry={entry} />);

    const toggle = screen.getByRole("button", {
      name: `View ${propCount} props`,
    });

    toggle.click();

    await waitFor(() => {
      expect(toggle).toHaveAttribute("aria-expanded", "true");
    });
    expect(toggle).toHaveTextContent("Hide props");

    const table = screen.getByRole("table");
    const firstCell = within(table).getAllByRole("cell")[0];
    await waitFor(() => {
      expect(firstCell).toHaveFocus();
    });
  });

  it("associates the disclosure controls with the props heading", () => {
    const propCount = PROPS_DISCLOSURE_COLLAPSE_THRESHOLD + 2;
    const entry = createEntry({
      props: Array.from({ length: propCount }, (_, index) => createProp(index + 1)),
    });

    renderWithTheme(<ComponentsView entry={entry} />);

    const heading = screen.getByRole("heading", { level: 3, name: "Props" });
    const toggle = screen.getByRole("button", {
      name: `View ${propCount} props`,
    });
    const panelId = toggle.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = panelId ? document.getElementById(panelId) : null;
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("aria-labelledby", heading.id);
  });
});
