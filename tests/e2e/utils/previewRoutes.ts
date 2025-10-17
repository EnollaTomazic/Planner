import {
  getGalleryPreviewAxisParams,
  getGalleryPreviewRoutes,
  type GalleryPreviewRoute,
} from "@/components/gallery";

export const NAV_BACKDROP_ENTRY_ID = "nav-backdrop";

export const DEPTH_PREVIEW_ENTRIES = new Set([
  "button",
  "icon-button",
  "card-demo",
  "neo-card-demo",
  NAV_BACKDROP_ENTRY_ID,
]);

const NAV_BACKDROP_BACKGROUNDS: GalleryPreviewRoute["themeBackground"][] = [
  0,
  1,
  2,
  3,
  4,
];

export function getDepthPreviewRoutes(): GalleryPreviewRoute[] {
  const seen = new Set<string>();

  return getGalleryPreviewRoutes().filter((route) => {
    if (!DEPTH_PREVIEW_ENTRIES.has(route.entryId)) {
      return false;
    }

    if (route.themeBackground !== 0) {
      return false;
    }

    if (seen.has(route.previewId)) {
      return false;
    }

    seen.add(route.previewId);
    return true;
  });
}

export function getBackgroundsForRoute(route: GalleryPreviewRoute) {
  if (route.entryId === NAV_BACKDROP_ENTRY_ID) {
    return NAV_BACKDROP_BACKGROUNDS;
  }

  return [route.themeBackground];
}

export function buildPreviewRouteUrl(route: GalleryPreviewRoute) {
  const params = new URLSearchParams();
  const suffixParts: string[] = [];

  for (const axis of getGalleryPreviewAxisParams(route.entryId, route.stateId)) {
    const option = axis.options[0];
    if (!option) {
      continue;
    }

    params.set(axis.key, option.value);
    suffixParts.push(`${axis.key}-${option.value}`);
  }

  const query = params.toString();
  const suffix = suffixParts.length > 0 ? `__${suffixParts.join("__")}` : "";
  const baseUrl = `/preview/${route.slug}/`;

  return {
    url: query ? `${baseUrl}?${query}` : baseUrl,
    suffix,
  };
}

export function createThemedUrl(
  baseUrl: string,
  variant: string,
  background: GalleryPreviewRoute["themeBackground"],
) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}theme=${variant}&bg=${background}`;
}

