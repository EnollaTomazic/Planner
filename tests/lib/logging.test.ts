import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLogger, redactForLogging } from "@/lib/logging";

describe("structured logger", () => {
  const originalLogLevel = process.env.LOG_LEVEL;

  beforeEach(() => {
    process.env.LOG_LEVEL = "debug";
  });

  afterEach(() => {
    if (typeof originalLogLevel === "undefined") {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
    vi.restoreAllMocks();
  });

  it("redacts PII from messages and details", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createLogger("test");

    logger.warn("Reach out at user@example.com", { phone: "555-555-1234" });

    expect(warn).toHaveBeenCalledTimes(1);
    const [label, payload] = warn.mock.calls[0] ?? [];
    expect(label).toBe("[planner:test]");
    expect(payload).toBeDefined();
    expect(payload.message).not.toContain("user@example.com");
    expect(payload.message).toContain("[redacted-email]");
    expect(JSON.stringify(payload.details)).not.toContain("555-555-1234");
    expect(JSON.stringify(payload.details)).toContain("[redacted-number]");
  });

  it("merges logger context with child context and redacts values", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const parent = createLogger("parent", { userEmail: "admin@example.com" });
    const child = parent.child("child", { session: "abc-123" });

    child.info("Child log", { identifier: "abc@example.com" });

    expect(info).toHaveBeenCalledTimes(1);
    const [, payload] = info.mock.calls[0] ?? [];
    expect(payload.scope).toBe("planner:parent:child");
    expect(payload.context.userEmail).toBe("[redacted-email]");
    expect(payload.context.session).toBe("abc-123");
    expect(JSON.stringify(payload.details)).toContain("[redacted-email]");
  });

  it("performs shallow redaction by default", () => {
    const payload = redactForLogging({
      email: "shallow@example.com",
      nested: { phone: "555-111-2222" },
      notes: ["call me", { email: "hidden@example.com" }],
    });

    expect(JSON.stringify(payload)).not.toContain("shallow@example.com");
    expect(JSON.stringify(payload)).toContain("[redacted-email]");
    expect(JSON.stringify(payload)).toContain("call me");
    expect(JSON.stringify(payload)).toContain("555-111-2222");
    expect(JSON.stringify(payload)).toContain("hidden@example.com");
  });

  it("redacts nested structures when deep mode is enabled", () => {
    const payload = redactForLogging(
      {
        account: {
          email: "another@example.com",
          contacts: ["555-111-2222", "ok"],
        },
      },
      { deep: true },
    );

    expect(JSON.stringify(payload)).not.toContain("another@example.com");
    expect(JSON.stringify(payload)).toContain("[redacted-email]");
    expect(JSON.stringify(payload)).toContain("[redacted-number]");
  });
});
