import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatQueryWithHash,
  useComponentsGalleryState,
} from "@/components/gallery-page/useComponentsGalleryState";
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
    replaceSpy.mockImplementation((_url, _options) => {});
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

  it("normalizes elements and styles view aliases", () => {
    searchParamsString = new URLSearchParams({
      section: "buttons",
      view: "elements",
    }).toString();
    const elementsHook = renderHook(() =>
      useComponentsGalleryState({
        navigation,
      }),
    );
    expect(elementsHook.result.current.view).toBe("primitives");
    elementsHook.unmount();

    searchParamsString = new URLSearchParams({
      section: "buttons",
      view: "styles",
    }).toString();
    const stylesHook = renderHook(() =>
      useComponentsGalleryState({
        navigation,
      }),
    );
    expect(stylesHook.result.current.view).toBe("tokens");
    stylesHook.unmount();
  });

  it("omits the question mark when all query params are cleared", () => {
    expect(formatQueryWithHash("", undefined)).toBe("");
    expect(formatQueryWithHash("", "")).toBe("");
    expect(formatQueryWithHash("", "#main")).toBe("#main");
  });

  it("clears the router URL when removing every query parameter", async () => {
    const initialParams = new URLSearchParams({ q: "chips" }).toString();
    searchParamsString = initialParams;

    const updateRouterState = (url: string) => {
      const [queryPart = "", hashPart] = url.split("#");
      if (hashPart !== undefined) {
        window.location.hash = hashPart ? `#${hashPart}` : "";
      } else {
        window.location.hash = "";
      }
      if (queryPart.startsWith("?")) {
        searchParamsString = queryPart.slice(1);
        return;
      }
      searchParamsString = queryPart;
    };

    const { result } = renderHook(() =>
      useComponentsGalleryState({
        navigation,
      }),
    );

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalled();
    });

    replaceSpy.mockClear();
    searchParamsString = initialParams;
    window.location.hash = "";

    replaceSpy.mockImplementation((url, _options) => {
      updateRouterState(url);
    });

    act(() => {
      result.current.setQuery("modal");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("?q=modal", { scroll: false });
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.setQuery("");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("", { scroll: false });
    });

    expect(replaceSpy.mock.calls.some(([url]) => url === "?")).toBe(false);

    replaceSpy.mockClear();
    window.location.hash = "#main";

    act(() => {
      result.current.setQuery("modal");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("?q=modal#main", {
        scroll: false,
      });
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.setQuery("");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("#main", { scroll: false });
    });

    expect(replaceSpy.mock.calls.some(([url]) => url === "?")).toBe(false);

    replaceSpy.mockClear();
    window.location.hash = "";

    act(() => {
      result.current.handleViewChange("complex");
    });

    await waitFor(() => {
      expect(result.current.view).toBe("complex");
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.setQuery("chips");
    });

    await waitFor(() => {
      expect(result.current.query).toBe("chips");
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.handleViewChange("primitives");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenCalled();
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.setQuery("");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("", { scroll: false });
    });

    expect(replaceSpy.mock.calls.some(([url]) => url === "?")).toBe(false);

    replaceSpy.mockClear();
    window.location.hash = "#gallery";

    act(() => {
      result.current.setQuery("modal");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("?q=modal#gallery", {
        scroll: false,
      });
    });

    replaceSpy.mockClear();

    act(() => {
      result.current.setQuery("");
    });

    await waitFor(() => {
      expect(replaceSpy).toHaveBeenLastCalledWith("#gallery", { scroll: false });
    });

    expect(replaceSpy.mock.calls.some(([url]) => url === "?")).toBe(false);
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
