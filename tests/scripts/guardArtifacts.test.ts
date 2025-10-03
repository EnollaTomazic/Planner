import { mkdtemp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { detectForbiddenArtifacts, FORBIDDEN_PATTERNS } from "../../scripts/guard-artifacts";

describe("detectForbiddenArtifacts", () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "guard-artifacts-"));
  });

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it("returns an empty list when nothing matches", async () => {
    await expect(detectForbiddenArtifacts(workspace)).resolves.toEqual([]);
  });

  it("reports known cache directories", async () => {
    await mkdir(path.join(workspace, "node-compile-cache", "tmp"), { recursive: true });
    await mkdir(path.join(workspace, "tsx-0"), { recursive: true });

    const matches = await detectForbiddenArtifacts(workspace);

    expect(matches).toEqual([
      {
        path: "node-compile-cache",
        label: FORBIDDEN_PATTERNS[0].label,
        resolution: FORBIDDEN_PATTERNS[0].resolution,
      },
      {
        path: "tsx-0",
        label: FORBIDDEN_PATTERNS[1].label,
        resolution: FORBIDDEN_PATTERNS[1].resolution,
      },
    ]);
  });

  it("ignores directories under node_modules", async () => {
    await mkdir(path.join(workspace, "node_modules", "node-compile-cache"), { recursive: true });
    await mkdir(path.join(workspace, "node_modules", "tsx-0"), { recursive: true });

    await expect(detectForbiddenArtifacts(workspace)).resolves.toEqual([]);
  });
});
