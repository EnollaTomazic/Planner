import { afterEach, describe, expect, test, vi } from "vitest";
import { runPromptVerification } from "../../scripts/verify-prompts.ts";

describe("verify-prompts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.PROMPT_CHECK_MODE;
  });

  test("executes without throwing", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(runPromptVerification({ argv: [] })).resolves.toBeUndefined();
  });

  test("warns when PROMPT_CHECK_MODE is set", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    process.env.PROMPT_CHECK_MODE = "legacy";

    await expect(runPromptVerification({ argv: [] })).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      "PROMPT_CHECK_MODE is no longer supported; remove the flag because the consolidated prompt verification always runs.",
    );
  });
});
