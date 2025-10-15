import { describe, expect, it } from "vitest";

import { readManifest } from "@/components/gallery/manifest-loader";

describe("gallery manifest", () => {
  it("includes AI abort button states with unique previews", () => {
    const manifest = readManifest();
    const sections = manifest.galleryPayload.sections;

    const aiAbortEntry = sections
      .flatMap((section) => section.entries)
      .find((entry) => entry.id === "ai-abort-button");

    expect(aiAbortEntry).toBeDefined();
    const states = aiAbortEntry?.states ?? [];
    const stateIds = states.map((state) => state.id);
    expect(stateIds).toEqual([
      "abort-busy",
      "abort-idle",
      "abort-custom-label",
    ]);

    const previewIds = states.map((state) => state.preview.id);
    expect(new Set(previewIds).size).toBe(previewIds.length);
  });
});
