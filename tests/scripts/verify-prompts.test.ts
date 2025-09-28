import { afterEach, describe, expect, test, vi } from "vitest";
import { runPromptVerification } from "../../scripts/verify-prompts.ts";

describe("verify-prompts modes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("modern mode executes without throwing", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      runPromptVerification({ mode: "modern", argv: [] }),
    ).resolves.toBeUndefined();
  });

  test("legacy mode executes without throwing", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      runPromptVerification({ mode: "legacy", argv: [] }),
    ).resolves.toBeUndefined();
  });
});
