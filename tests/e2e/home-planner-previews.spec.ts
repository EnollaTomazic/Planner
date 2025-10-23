import { expect, test, type Page } from "./playwright";

import type { GalleryPreviewRoute } from "@/components/gallery/registry";
import { VARIANTS } from "@/lib/theme";

import { buildPreviewRouteUrl, createThemedUrl } from "./utils/previewRoutes";
import { waitForThemeHydration, type ThemeHydrationPage } from "./utils/theme";
import { getManifestPreviewRoutes } from "./utils/galleryManifest";

type PreviewSection = "home" | "planner";

const HOME_ENTRY_IDS = new Set(["hero-planner-cards", "quick-action-grid"]);
const PLANNER_ENTRY_IDS = new Set(["calendar", "week-picker", "bottom-nav"]);

const BASE_PREVIEW_ROUTES = getManifestPreviewRoutes();

type PreviewTestPage = Page & ThemeHydrationPage;

const VIEWPORT_CONTAINER_TARGETS: ReadonlyArray<{
  maxWidth: number;
  containerId: "cq-sm" | "cq-md" | "cq-lg";
  sliderIndex: number;
}> = [
  { maxWidth: 480, containerId: "cq-sm", sliderIndex: 0 },
  { maxWidth: 1024, containerId: "cq-md", sliderIndex: 1 },
  { maxWidth: Number.POSITIVE_INFINITY, containerId: "cq-lg", sliderIndex: 2 },
];

function collectBaseRoutes(
  sectionId: "homepage" | "planner",
  entryIds: ReadonlySet<string>,
): GalleryPreviewRoute[] {
  const selected = new Map<string, GalleryPreviewRoute>();

  for (const route of BASE_PREVIEW_ROUTES) {
    if (route.sectionId !== sectionId) {
      continue;
    }
    if (!entryIds.has(route.entryId)) {
      continue;
    }
    if (route.themeVariant !== "lg") {
      continue;
    }
    if (route.themeBackground !== 0) {
      continue;
    }
    if (route.stateId) {
      continue;
    }
    if (selected.has(route.entryId)) {
      continue;
    }
    selected.set(route.entryId, route);
  }

  return Array.from(selected.values());
}

async function visitPreview(
  page: PreviewTestPage,
  route: GalleryPreviewRoute,
  variantId: (typeof VARIANTS)[number]["id"],
) {
  const { url, suffix } = buildPreviewRouteUrl(route);
  const themedUrl = createThemedUrl(url, variantId, route.themeBackground);

  await page.goto(themedUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('[data-preview-ready="loaded"]');
  await waitForThemeHydration(page, variantId, route.themeBackground);
  await page.waitForFunction(
    () => !document.body.innerText.includes("Loading preview…"),
  );

  return { suffix };
}

async function setContainerForViewport(page: PreviewTestPage) {
  const viewport = page.viewportSize();
  if (!viewport) {
    return { containerId: "cq-lg", sliderIndex: 2 } as const;
  }

  const target = VIEWPORT_CONTAINER_TARGETS.find(
    (candidate) => viewport.width <= candidate.maxWidth,
  ) ?? VIEWPORT_CONTAINER_TARGETS[VIEWPORT_CONTAINER_TARGETS.length - 1];

  const slider = page.getByLabel("Container width");
  await slider.evaluate((element: Element, value: string) => {
    const input = element as HTMLInputElement;
    if (input.value === value) {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, String(target.sliderIndex));

  await page.waitForSelector(
    `[data-preview-container][data-container-size="${target.containerId}"][data-preview-ready="loaded"]`,
  );

  return target;
}

async function collectInteractiveIssues(page: PreviewTestPage) {
  return page.evaluate(() => {
    const container = document.querySelector(
      '[data-preview-container][data-preview-ready="loaded"]',
    );
    if (!container) {
      return ["preview-container-missing"];
    }

    const interactiveSelectors = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "[role=button]",
      "[role=link]",
      "[tabindex]",
    ].join(",");

    const candidates = Array.from(
      new Set(
        Array.from(container.querySelectorAll<HTMLElement>(interactiveSelectors)),
      ),
    );

    const issues: string[] = [];

    for (const element of candidates) {
      if (element.matches("[disabled], [aria-hidden='true']")) {
        continue;
      }
      if (element.tabIndex === -1 && !element.hasAttribute("role")) {
        continue;
      }

      const style = window.getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none") {
        continue;
      }

      element.scrollIntoView({ block: "nearest", inline: "nearest" });
      const rect = element.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(`zero-size:${element.tagName.toLowerCase()}`);
        continue;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (centerX < 0 || centerX > window.innerWidth || centerY < 0 || centerY > window.innerHeight) {
        issues.push(
          `out-of-viewport:${element.tagName.toLowerCase()}@${Math.round(centerX)}x${Math.round(centerY)}`,
        );
        continue;
      }

      const hit = document.elementFromPoint(centerX, centerY);
      if (!hit) {
        issues.push(`no-hit:${element.tagName.toLowerCase()}`);
        continue;
      }

      if (hit !== element && !element.contains(hit) && !hit.contains(element)) {
        const label =
          element.getAttribute("aria-label")?.trim() ??
          element.textContent?.trim() ??
          element.tagName.toLowerCase();
        issues.push(`overlap:${label}->${hit.tagName.toLowerCase()}`);
      }
    }

    return issues;
  });
}

async function assertNoHorizontalOverflow(page: PreviewTestPage) {
  const overflow = (await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    if (!root) {
      return 0;
    }
    return Math.max(0, root.scrollWidth - window.innerWidth);
  })) as number;

  if (overflow > 1) {
    throw new Error(`preview overflowed viewport by ${overflow}px`);
  }
}

async function assertPreviewHealth(page: PreviewTestPage) {
  const issues = await collectInteractiveIssues(page);
  expect(issues).toEqual([]);
  await assertNoHorizontalOverflow(page);
}

function formatScreenshotName(
  section: PreviewSection,
  route: GalleryPreviewRoute,
  suffix: string,
  variantId: (typeof VARIANTS)[number]["id"],
  widthLabel: string,
  containerId: string,
) {
  const suffixSegment = suffix ? suffix.replace(/^__/, "") : null;
  const parts = [section, route.entryId];
  if (suffixSegment) {
    parts.push(suffixSegment);
  }
  parts.push(variantId, containerId, widthLabel);
  return `${parts.join("--")}.png`;
}

function runPreviewSuite(
  section: PreviewSection,
  routes: GalleryPreviewRoute[],
) {
  for (const route of routes) {
    test(`@smoke ${section} preview · ${route.entryId} preserves layout`, async ({ page }) => {
      const previewPage = page as unknown as PreviewTestPage;

      await page.addInitScript(() => {
        try {
          window.localStorage?.clear();
        } catch {
          // Ignore storage access issues in environments without DOM APIs.
        }
      });

      for (const variant of VARIANTS) {
        const { suffix } = await visitPreview(previewPage, route, variant.id);
        const { containerId } = await setContainerForViewport(previewPage);

        await assertPreviewHealth(previewPage);

        await page.evaluate(() => window.scrollTo(0, 0));
        const viewport = page.viewportSize();
        const widthLabel = viewport ? `${viewport.width}w` : "no-viewport";

        await expect(page).toHaveScreenshot(
          formatScreenshotName(section, route, suffix, variant.id, widthLabel, containerId),
          { fullPage: true },
        );
      }
    });
  }
}

const HOME_ROUTES = collectBaseRoutes("homepage", HOME_ENTRY_IDS);
if (HOME_ROUTES.length === 0) {
  throw new Error("No home preview routes were resolved for smoke coverage");
}

const PLANNER_ROUTES = collectBaseRoutes("planner", PLANNER_ENTRY_IDS);
if (PLANNER_ROUTES.length === 0) {
  throw new Error("No planner preview routes were resolved for smoke coverage");
}

test.describe("Home preview smoke coverage", () => {
  runPreviewSuite("home", HOME_ROUTES);
});

test.describe("Planner preview smoke coverage", () => {
  runPreviewSuite("planner", PLANNER_ROUTES);
});
