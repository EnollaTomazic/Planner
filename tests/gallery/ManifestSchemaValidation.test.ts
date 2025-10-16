import { describe, expect, it } from "vitest";

import { manifest } from "@/components/gallery/generated-manifest.g";
import { ManifestSchema } from "@/components/gallery/manifest.schema";

describe("gallery manifest", () => {
  it("matches the manifest schema", () => {
    const result = ManifestSchema.safeParse(manifest);
    if (!result.success) {
      console.error(result.error.format());
    }
    expect(result.success).toBe(true);
  });
});
