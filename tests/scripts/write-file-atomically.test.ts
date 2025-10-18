import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { writeFileAtomically } from "../../scripts/utils/write-file-atomically";

describe("writeFileAtomically", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "write-file-atomically-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes the requested content", async () => {
    const target = path.join(tempDir, "example.txt");

    await writeFileAtomically(target, "hello world", { encoding: "utf8" });

    const result = await fs.readFile(target, "utf8");
    expect(result).toBe("hello world");
  });

  it("retries when rename reports EEXIST", async () => {
    const target = path.join(tempDir, "retry.txt");
    await fs.writeFile(target, "original", "utf8");

    const originalRename = fs.rename.bind(fs);
    const renameSpy = vi
      .spyOn(fs, "rename")
      .mockImplementationOnce(async () => {
        const error = new Error("exists") as NodeJS.ErrnoException;
        error.code = "EEXIST";
        throw error;
      })
      .mockImplementation((...args) => originalRename(...args));

    await writeFileAtomically(target, "updated", { encoding: "utf8", maxRetries: 3 });

    const result = await fs.readFile(target, "utf8");
    expect(result).toBe("updated");
    expect(renameSpy).toHaveBeenCalledTimes(2);
  });
});
