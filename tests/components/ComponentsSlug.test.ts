import { describe, expect, it } from "vitest";

import {
  getAllComponentSlugs,
  resolveComponentsSlug,
} from "@/components/components/slug";

describe("ComponentsSlug", () => {
  it("resolves known section slugs", () => {
    const result = resolveComponentsSlug("buttons");
    expect(result).toMatchObject({ section: "buttons" });
    expect(result?.view).toBe("primitives");
  });

  it("resolves entry slugs", () => {
    const result = resolveComponentsSlug("button");
    expect(result).toMatchObject({ section: "buttons" });
    expect(result?.query).toBe("Button");
  });

  it("resolves tagged alias slugs", () => {
    const result = resolveComponentsSlug("action-buttons");
    expect(result).toMatchObject({ section: "buttons" });
    expect(result?.query).toBe("Button");
  });

  it("resolves legacy theme split alias", () => {
    const result = resolveComponentsSlug("theme-splits");
    expect(result).toMatchObject({
      section: "layout",
      view: "components",
    });
    expect(result?.query).toBe("Split");
  });

  it("maps view aliases", () => {
    const result = resolveComponentsSlug("colors");
    expect(result).toMatchObject({ view: "tokens" });
    expect(result?.section).toBeUndefined();
  });

  it("maps prompts to the components view", () => {
    const sectionResult = resolveComponentsSlug("prompts");
    expect(sectionResult).toMatchObject({
      section: "prompts",
      view: "components",
    });

    const entryResult = resolveComponentsSlug("prompt-list");
    expect(entryResult).toMatchObject({
      section: "prompts",
      view: "components",
    });
  });

  it("returns null for unknown slugs", () => {
    expect(resolveComponentsSlug("unknown")).toBeNull();
  });

  it("exposes all static params", () => {
    const slugs = getAllComponentSlugs();
    expect(slugs).toContain("buttons");
    expect(slugs).toContain("button");
    expect(slugs).toContain("action-buttons");
    expect(slugs).toContain("colors");
  });
});
