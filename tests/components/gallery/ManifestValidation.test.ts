import { describe, expect, it, vi } from "vitest";

describe("gallery manifest validation", () => {
  it("throws when the generated manifest is malformed", async () => {
    const originalNodeEnv = process.env.NODE_ENV;

    vi.resetModules();
    vi.doMock("@/components/gallery/generated-manifest.g", () => ({
      __esModule: true,
      default: {
        galleryPayload: { sections: [] },
        galleryPreviewRoutes: [],
        galleryPreviewModules: {},
      },
      galleryPayload: { sections: [] },
      galleryPreviewRoutes: [],
      galleryPreviewModules: {},
    }));

    try {
      await expect(import("@/components/gallery/manifest")).rejects.toThrowError(
        /Gallery manifest validation failed/,
      );
    } finally {
      vi.doUnmock("@/components/gallery/generated-manifest.g");
      vi.resetModules();
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
