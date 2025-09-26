import { describe, expect, it } from "vitest";

import { galleryPayload } from "@/components/gallery/generated-manifest";
import type { GalleryAxis } from "@/components/gallery/registry";

describe("gallery primitives", () => {
  it("document required interaction states", () => {
    const primitiveEntries = galleryPayload.sections.flatMap((section) =>
      section.entries.filter((entry) => {
        if (entry.kind !== "primitive") {
          return false;
        }
        const axes = (entry as { axes?: readonly GalleryAxis[] }).axes;
        return (axes ?? []).some((axis) => axis.type === "state");
      }),
    );

    for (const entry of primitiveEntries) {
      const axes = (entry as { axes?: readonly GalleryAxis[] }).axes ?? [];
      const states = (entry as { states?: readonly { id: string }[] }).states;
      if (!states) {
        continue;
      }

      const stateIds = new Set(states.map((state) => state.id));
      const requiresDefault = axes.some((axis) =>
        axis.type === "state" &&
        axis.values.some((value) => value.value.toLowerCase().includes("default")),
      );
      const requiresHover = axes.some((axis) =>
        axis.type === "state" &&
        axis.values.some((value) => value.value.toLowerCase().includes("hover")),
      );
      const requiresFocus = axes.some((axis) =>
        axis.type === "state" &&
        axis.values.some((value) => value.value.toLowerCase().includes("focus")),
      );
      const requiresDisabled = axes.some((axis) =>
        axis.type === "state" &&
        axis.values.some((value) => value.value.toLowerCase().includes("disabled")),
      );

      if (requiresDefault) {
        expect(stateIds.has("default"), `${entry.id} is missing a default state`).toBe(
          true,
        );
      }
      if (requiresHover) {
        expect(stateIds.has("hover"), `${entry.id} is missing a hover state`).toBe(true);
      }
      if (requiresFocus) {
        expect(
          stateIds.has("focus") || stateIds.has("focus-visible"),
          `${entry.id} is missing a focus-visible state`,
        ).toBe(true);
      }
      if (requiresDisabled) {
        expect(stateIds.has("disabled"), `${entry.id} is missing a disabled state`).toBe(true);
      }
    }
  });
});
