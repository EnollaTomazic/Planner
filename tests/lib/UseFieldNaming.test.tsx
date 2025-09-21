import { renderHook, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import useFieldNaming from "../../src/lib/useFieldNaming";
import { slugify } from "../../src/lib/utils";

afterEach(cleanup);

describe("UseFieldNaming", () => {
  it("returns slugified aria-label by default", () => {
    const { result } = renderHook(() =>
      useFieldNaming({ ariaLabel: "Project Name" }),
    );

    expect(result.current.name).toBe("project-name");
    expect(typeof result.current.id).toBe("string");
    expect(result.current.id.length).toBeGreaterThan(0);
  });

  it("respects provided overrides", () => {
    const { result } = renderHook(() =>
      useFieldNaming({
        id: "custom-id",
        name: "custom-name",
        ariaLabel: "ignored",
      }),
    );

    expect(result.current.id).toBe("custom-id");
    expect(result.current.name).toBe("custom-name");
  });

  it("only uses aria-label slug with explicit id when strategy is custom-id", () => {
    const withExplicitId = renderHook(() =>
      useFieldNaming({
        id: "field-id",
        ariaLabel: "Display Name",
        ariaLabelStrategy: "custom-id",
      }),
    );

    expect(withExplicitId.result.current.id).toBe("field-id");
    expect(withExplicitId.result.current.name).toBe("display-name");

    const withoutExplicitId = renderHook(() =>
      useFieldNaming({
        ariaLabel: "Display Name",
        ariaLabelStrategy: "custom-id",
      }),
    );

    expect(withoutExplicitId.result.current.name).toBe(
      withoutExplicitId.result.current.id,
    );
  });

  it("slugifies the fallback id when requested", () => {
    const { result } = renderHook(() => useFieldNaming({ slugifyFallback: true }));

    expect(result.current.name).toBe(slugify(result.current.id));
  });
});
