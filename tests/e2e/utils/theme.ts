import { BG_CLASSES } from "@/lib/theme";

export interface ThemeHydrationPage {
  waitForFunction<T>(
    pageFunction: (...args: unknown[]) => T,
    arg?: unknown,
  ): Promise<T>;
}

export async function waitForThemeHydration(
  page: ThemeHydrationPage,
  variantId: string,
  background: number,
) {
  await page.waitForFunction(
    (arg: unknown) => {
      const params = arg as {
        variantId: string;
        background: number;
        bgClasses: readonly string[];
      };
      const {
        variantId: currentVariant,
        background: currentBackground,
        bgClasses,
      } = params;
      const { classList } = document.documentElement;
      const variantReady = classList.contains(`theme-${currentVariant}`);
      const expectedBackgroundClass =
        currentBackground > 0 ? bgClasses[currentBackground] ?? "" : "";
      const hasExpectedBackground =
        expectedBackgroundClass.length > 0
          ? classList.contains(expectedBackgroundClass)
          : !bgClasses.some(
              (className: string, index: number) =>
                index > 0 &&
                className.length > 0 &&
                classList.contains(className),
            );
      const hasColorScheme =
        classList.contains("color-scheme-dark") ||
        classList.contains("color-scheme-light");
      return variantReady && hasExpectedBackground && hasColorScheme;
    },
    { variantId, background, bgClasses: BG_CLASSES },
  );
}
