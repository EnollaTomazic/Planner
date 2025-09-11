import { describe, it, expect } from "vitest";
import { cn, slugify, sanitizeText } from "../../src/lib/utils";

describe("cn", () => {
  it("handles strings", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
    expect(cn("foo", "", "bar", undefined, null, false, "baz")).toBe(
      "foo bar baz",
    );
  });

  it("handles numbers", () => {
    expect(cn(1, 2, 3)).toBe("1 2 3");
    expect(cn(0, 1, 2, 0)).toBe("1 2");
  });

  it("handles nested arrays", () => {
    expect(cn(["foo", ["bar", null], undefined, ["baz", ["", ["qux"]]]])).toBe(
      "foo bar baz qux",
    );
  });

  it("handles objects with truthy and falsy values", () => {
    expect(
      cn({ foo: true, bar: false, baz: 0, qux: 1, quux: "", corge: "yes" }),
    ).toBe("foo qux corge");
  });

  it("handles mixed inputs", () => {
    const result = cn(
      "foo",
      1,
      ["bar", ["baz", { qux: true, quux: 0 }]],
      { corge: true, grault: false },
      null,
      undefined,
      0,
    );
    expect(result).toBe("foo 1 bar baz qux corge");
  });
});

describe("slugify", () => {
  it("converts strings to kebab-case", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  Multiple   Spaces ")).toBe("multiple-spaces");
  });

  it("handles empty values", () => {
    expect(slugify("")).toBe("");
    expect(slugify(undefined)).toBe("");
  });
});

describe("sanitizeText", () => {
  it("escapes HTML-unsafe characters", () => {
    expect(sanitizeText(`<div>&"'</div>`)).toBe(
      "&lt;div&gt;&amp;&quot;&#39;&lt;/div&gt;",
    );
  });
});
