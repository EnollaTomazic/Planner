import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const manifestPath = path.resolve(
  process.cwd(),
  "src/components/gallery/generated-manifest.g.ts",
);

const requiredSnippets = [
  "// checksum:",
  "export const manifest =",
] as const;

describe("gallery manifest source", () => {
  it("contains the expected exports", () => {
    const manifestSource = readFileSync(manifestPath, "utf8");

    for (const requiredSnippet of requiredSnippets) {
      expect(manifestSource).toContain(requiredSnippet);
    }
  });
});
