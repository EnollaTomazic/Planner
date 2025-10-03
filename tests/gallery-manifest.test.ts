import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const manifestPath = path.resolve(
  process.cwd(),
  "src/components/gallery/generated-manifest.ts",
);

const requiredExports = [
  "export const galleryPayload",
  "export const galleryPreviewRoutes",
  "export const galleryPreviewModules",
] as const;

describe("gallery manifest source", () => {
  it("contains the expected exports", () => {
    const manifestSource = readFileSync(manifestPath, "utf8");

    for (const requiredExport of requiredExports) {
      expect(manifestSource).toContain(requiredExport);
    }
  });
});
