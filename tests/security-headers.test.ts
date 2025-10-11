import { describe, expect, it } from "vitest";

import {
  createContentSecurityPolicy,
  createSecurityHeaders,
  sanitizeContentSecurityPolicyForMeta,
} from "../security-headers.mjs";

describe("content security policy variants", () => {
  it("keeps the frame-ancestors directive for HTTP headers", () => {
    const headers = createSecurityHeaders();
    const policyHeader = headers.find(
      (header) => header.key === "Content-Security-Policy",
    );

    expect(policyHeader?.value).toContain("frame-ancestors 'none'");
  });

  it("omits unsupported directives in meta policies", () => {
    const policy = createContentSecurityPolicy();
    const metaPolicy = sanitizeContentSecurityPolicyForMeta(policy);

    expect(policy).toContain("frame-ancestors 'none'");
    expect(metaPolicy).not.toContain("frame-ancestors");
    expect(metaPolicy).toContain("default-src 'self'");
  });
});
