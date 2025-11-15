import { afterEach, describe, expect, it, vi } from "vitest";

const originalMetricsEndpoint = process.env.NEXT_PUBLIC_METRICS_ENDPOINT;

const reloadSecurityHeaders = async () => {
  vi.resetModules();
  return import("../security-headers.mjs");
};

afterEach(() => {
  process.env.NEXT_PUBLIC_METRICS_ENDPOINT = originalMetricsEndpoint;
});

describe("content security policy variants", () => {
  it("keeps the frame-ancestors directive for HTTP headers", async () => {
    const { createSecurityHeaders } = await reloadSecurityHeaders();
    const headers = createSecurityHeaders();
    const policyHeader = headers.find(
      (header) => header.key === "Content-Security-Policy",
    );

    expect(policyHeader?.value).toContain("frame-ancestors 'none'");
  });

  it("omits unsupported directives in meta policies", async () => {
    const {
      createContentSecurityPolicy,
      sanitizeContentSecurityPolicyForMeta,
    } = await reloadSecurityHeaders();
    const policy = createContentSecurityPolicy();
    const metaPolicy = sanitizeContentSecurityPolicyForMeta(policy);

    expect(policy).toContain("frame-ancestors 'none'");
    expect(metaPolicy).not.toContain("frame-ancestors");
    expect(metaPolicy).toContain("default-src 'self'");
  });

  it("adds remote metrics origins to connect-src", async () => {
    process.env.NEXT_PUBLIC_METRICS_ENDPOINT =
      "https://metrics.example.com/api/v1";

    const { createContentSecurityPolicy } = await reloadSecurityHeaders();
    const policy = createContentSecurityPolicy();
    const connectDirective = policy
      .split("; ")
      .find((directive) => directive.startsWith("connect-src "));

    expect(connectDirective).toContain("https://metrics.example.com");
  });

  it("ignores same-origin metrics endpoints", async () => {
    process.env.NEXT_PUBLIC_METRICS_ENDPOINT = "/api/metrics";

    const { createContentSecurityPolicy } = await reloadSecurityHeaders();
    const policy = createContentSecurityPolicy();
    const connectDirective = policy
      .split("; ")
      .find((directive) => directive.startsWith("connect-src "));

    expect(connectDirective).toBe("connect-src 'self'");
  });
});
