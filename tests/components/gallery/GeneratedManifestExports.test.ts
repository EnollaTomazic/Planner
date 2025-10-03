import { describe, expect, it } from "vitest";

import {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
  type GalleryPreviewModuleManifest,
} from "@/components/gallery/generated-manifest";

describe("gallery manifest exports", () => {
  it("exposes the gallery payload", () => {
    expect(galleryPayload).toBeDefined();
    expect(Array.isArray(galleryPayload.sections)).toBe(true);
    expect(galleryPayload.sections.length).toBeGreaterThan(0);
  });

  it("exposes preview route metadata", () => {
    expect(Array.isArray(galleryPreviewRoutes)).toBe(true);
    expect(galleryPreviewRoutes.length).toBeGreaterThan(0);

    const sampleRoute = galleryPreviewRoutes[0];
    expect(sampleRoute).toBeDefined();
    expect(typeof sampleRoute.slug).toBe("string");
    expect(typeof sampleRoute.previewId).toBe("string");
  });

  it("exposes preview modules with loaders", () => {
    expect(galleryPreviewModules).toBeDefined();
    expect(typeof galleryPreviewModules).toBe("object");

    const manifests = Object.values(galleryPreviewModules);
    expect(manifests.length).toBeGreaterThan(0);

    const manifest = manifests[0] as GalleryPreviewModuleManifest | undefined;
    expect(manifest).toBeDefined();
    expect(typeof manifest?.loader).toBe("function");
    expect(Array.isArray(manifest?.previewIds)).toBe(true);
  });
});
