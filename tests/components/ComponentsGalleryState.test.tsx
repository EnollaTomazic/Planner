import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useComponentsGalleryState } from "@/components/components/useComponentsGalleryState";
import type { GalleryNavigationData } from "@/components/gallery/types";

const replaceSpy = vi.fn<(url: string, options?: { scroll: boolean }) => void>();
let searchParamsString = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceSpy,
  }),
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

vi.mock("@/components/prompts/constants", () => ({
  getGallerySectionEntries: vi.fn(() => []),
}));

function mockUsePersistentState<T>(
  _key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  return React.useState<T>(initial);
}

vi.mock("@/lib/db", () => ({
  usePersistentState: mockUsePersistentState,
}));

const navigation: GalleryNavigationData = {
  groups: [
    {
      id: "primitives",
      label: "Primitives",
      copy: {
        eyebrow: "Primitives",
        heading: "Primitives",
        subtitle: "Primitive components",
      },
      sections: [
        {
          id: "buttons",
          label: "Buttons",
          copy: {
            eyebrow: "Buttons",
            heading: "Buttons",
            subtitle: "Button components",
          },
          groupId: "primitives",
        },
        {
          id: "inputs",
          label: "Inputs",
          copy: {
            eyebrow: "Inputs",
            heading: "Inputs",
            subtitle: "Input components",
          },
          groupId: "primitives",
        },
      ],
    },
    {
      id: "complex",
      label: "Complex",
      copy: {
        eyebrow: "Complex",
        heading: "Complex",
        subtitle: "Complex components",
      },
      sections: [
        {
          id: "homepage",
          label: "Homepage",
          copy: {
            eyebrow: "Homepage",
            heading: "Homepage",
            subtitle: "Homepage components",
          },
          groupId: "complex",
        },
      ],
    },
  ],
};

describe("useComponentsGalleryState", () => {
  beforeEach(() => {
    searchParamsString = new URLSearchParams({ section: "buttons" }).toString();
    replaceSpy.mockClear();
    window.location.hash = "";
  });

  it("preserves the hash fragment when updating the section", async () => {
    window.location.hash = "#main-content";

    const { result } = renderHook(() =>
      useComponentsGalleryState({
        navigation,
      }),
    );

    act(() => {
      result.current.handleSectionChange("inputs");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalledWith("?section=inputs#main-content", {
        scroll: false,
      });
    });
  });

  it("defaults to the complex homepage section when section param is missing", () => {
    searchParamsString = new URLSearchParams({ view: "complex" }).toString();

    const { result } = renderHook(() =>
      useComponentsGalleryState({
        navigation,
      }),
    );

    expect(result.current.view).toBe("complex");
    expect(result.current.section).toBe("homepage");
  });
});
