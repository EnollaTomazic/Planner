import { describe, expect, it } from "vitest";

import { HERO_ILLUSTRATION_LIBRARY } from "@/data/heroImages";
import { VARIANTS } from "@/lib/theme";

describe("hero illustration library", () => {
  it("contains an idle illustration for every theme variant", () => {
    for (const { id } of VARIANTS) {
      const library = HERO_ILLUSTRATION_LIBRARY[id];
      expect(library).toBeDefined();

      const idle = library?.idle;
      expect(idle).toBeDefined();
      expect(idle?.src).toBeDefined();
      expect(typeof idle?.alt).toBe("string");
      expect((idle?.alt ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});
