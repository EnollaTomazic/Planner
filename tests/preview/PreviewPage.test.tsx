import React from "react";
import { render } from "@testing-library/react";
import type { GalleryPreviewRoute } from "@/components/gallery";
import { describe, expect, it, vi } from "vitest";
import { PreviewContent, PreviewUnavailable } from "@/app/preview/[slug]/page";

(globalThis as { React?: typeof React }).React = React;

vi.mock("@/components/gallery/PreviewSurfaceClient", () => ({
  __esModule: true,
  default: () => <div data-testid="preview-surface" />,
  PREVIEW_SURFACE_CONTAINER_CLASSNAME: "preview-surface",
}));

vi.mock("@/components/gallery/PreviewThemeClient", () => ({
  default: () => null,
}));

const baseRoute: GalleryPreviewRoute = {
  slug: "sample",
  previewId: "preview-id",
  entryId: "entry-id",
  entryName: "Sample preview",
  sectionId: "components",
  stateId: null,
  stateName: null,
  themeVariant: "lg",
  themeBackground: 0,
};

describe("Preview page landmarks", () => {
  it("renders a single main landmark when the preview loads", () => {
    const { container } = render(
      <main id="main-content">
        <PreviewContent route={baseRoute} />
      </main>,
    );

    const landmarks = container.querySelectorAll("main, [role=\"main\"]");
    expect(landmarks).toHaveLength(1);
  });

  it("renders a single main landmark when the preview is unavailable", () => {
    const { container } = render(
      <main id="main-content">
        <PreviewUnavailable route={baseRoute} />
      </main>,
    );

    const landmarks = container.querySelectorAll("main, [role=\"main\"]");
    expect(landmarks).toHaveLength(1);
  });
});
