import { expect, test } from "@playwright/test";

const previewTargets = [
  {
    label: "ring-noise-light",
    url: "/tests/ring-noise?variant=lg",
  },
  {
    label: "ring-noise-aurora",
    url: "/tests/ring-noise?variant=aurora",
  },
] as const;

interface GradientStats {
  readonly sampleCount: number;
  readonly luminanceRange: number;
  readonly highContrastSegments: number;
  readonly uniqueRoundedLuminance: number;
}

test.describe("Ring icon gradient noise", () => {
  for (const preview of previewTargets) {
    test(
      `renders masked gradient without banding for ${preview.label}`,
      async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(preview.url);
        await page.waitForLoadState("networkidle");
        const surface = page.locator('[data-testid="ring-noise-surface"]');
        await surface.waitFor();
        const svg = surface.locator("svg").first();
        await svg.waitFor({ state: "visible", timeout: 20000 });
        await expect(svg).toBeVisible();

        const stats = await svg.evaluate<GradientStats>(async (element: Element) => {
          const svgElement = element as SVGSVGElement;
          const serializer = new XMLSerializer();
          const clone = svgElement.cloneNode(true) as SVGSVGElement;
          clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          const viewBox = clone.viewBox.baseVal;
          const resolvedWidth = Math.ceil(
            (viewBox && viewBox.width > 0
              ? viewBox.width
              : Number(clone.getAttribute("width"))) || 0,
          );
          const resolvedHeight = Math.ceil(
            (viewBox && viewBox.height > 0
              ? viewBox.height
              : Number(clone.getAttribute("height"))) || 0,
          );
          const width = Math.max(1, resolvedWidth);
          const height = Math.max(1, resolvedHeight);
          const svgMarkup = serializer.serializeToString(clone);
          const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);

          function sampleLuminance(data: Uint8ClampedArray, x: number, y: number) {
            const offset = (y * width + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          }

          try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image(width, height);
              img.decoding = "async";
              img.onload = () => resolve(img);
              img.onerror = (error) => reject(error);
              img.src = url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) {
              throw new Error("Canvas context unavailable");
            }

            context.drawImage(image, 0, 0, width, height);
            const imageData = context.getImageData(0, 0, width, height);
            const centerY = Math.max(0, Math.min(height - 1, Math.floor(height / 2)));
            const step = Math.max(1, Math.floor(width / 48));
            const luminances: number[] = [];

            for (let x = step; x < width - step; x += step) {
              luminances.push(sampleLuminance(imageData.data, x, centerY));
            }

            const uniqueRoundedLuminance = new Set(
              luminances.map((value) => Math.round(value)),
            ).size;

            let luminanceRange = 0;
            if (luminances.length > 0) {
              const max = Math.max(...luminances);
              const min = Math.min(...luminances);
              luminanceRange = max - min;
            }

            const highContrastSegments = luminances.reduce((count, value, index, array) => {
              if (index === 0) {
                return count;
              }
              const prev = array[index - 1];
              return Math.abs(value - prev) > 1.5 ? count + 1 : count;
            }, 0);

            return {
              sampleCount: luminances.length,
              luminanceRange,
              highContrastSegments,
              uniqueRoundedLuminance,
            } satisfies GradientStats;
          } finally {
            URL.revokeObjectURL(url);
          }
        });

        expect.soft(stats.sampleCount).toBeGreaterThan(12);
        expect(stats.luminanceRange).toBeGreaterThan(25);
        expect(stats.uniqueRoundedLuminance).toBeGreaterThan(stats.sampleCount / 2);
        expect(stats.highContrastSegments).toBeGreaterThan(stats.sampleCount * 0.4);
      },
    );
  }
});
