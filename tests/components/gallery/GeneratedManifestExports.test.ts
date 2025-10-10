import { describe, expect, it } from "vitest";

import galleryManifest, {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
} from "@/components/gallery/generated-manifest.g";
import type { GalleryPreviewModuleManifest } from "@/components/gallery/manifest.schema";

describe("gallery manifest exports", () => {
  it("exposes the gallery payload", () => {
    expect(galleryManifest.galleryPayload).toBe(galleryPayload);
    expect(galleryPayload).toBeDefined();
    expect(Array.isArray(galleryPayload.sections)).toBe(true);
    expect(galleryPayload.sections.length).toBeGreaterThan(0);
  });

  it("exposes preview route metadata", () => {
    expect(galleryManifest.galleryPreviewRoutes).toBe(galleryPreviewRoutes);
    expect(Array.isArray(galleryPreviewRoutes)).toBe(true);
    expect(galleryPreviewRoutes.length).toBeGreaterThan(0);

    const sampleRoute = galleryPreviewRoutes[0];
    expect(sampleRoute).toBeDefined();
    expect(typeof sampleRoute.slug).toBe("string");
    expect(typeof sampleRoute.previewId).toBe("string");
  });

  it("exposes preview modules with loaders", () => {
    expect(galleryManifest.galleryPreviewModules).toBe(galleryPreviewModules);
    expect(galleryPreviewModules).toBeDefined();
    expect(typeof galleryPreviewModules).toBe("object");

    const manifests = Object.values(galleryPreviewModules);
    expect(manifests.length).toBeGreaterThan(0);

    const moduleManifest = manifests[0] as
      | GalleryPreviewModuleManifest
      | undefined;
    expect(moduleManifest).toBeDefined();
    expect(typeof moduleManifest?.loader).toBe("function");
    expect(Array.isArray(moduleManifest?.previewIds)).toBe(true);
  });
});
