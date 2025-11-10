// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";
import "@/env/validate-server-env";

import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import {
  geistMonoClassName,
  geistMonoVariable,
  geistSansClassName,
  geistSansVariable,
} from "./fonts";
import tokens from "../../tokens/tokens.js";
import { resolveTokenColor } from "@/lib/color";
import { FooterYear } from "@/components/chrome/FooterYear";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { CatCompanion, DecorLayer, PageShell, SkipLink } from "@/components/ui";
import { getBasePath, withBasePath } from "@/lib/utils";
import Script from "next/script";
import ThemeProvider from "@/lib/theme-context";
import { THEME_BOOTSTRAP_SCRIPT_PATH } from "@/lib/theme";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";
import DepthThemeProvider from "@/lib/depth-theme-context";
import { initializeObservability } from "@/lib/observability/sentry";
import {
  depthThemeEnabled,
  glitchLandingEnabled,
  organicDepthEnabled,
} from "@/lib/features";
import { GITHUB_PAGES_BOOTSTRAP_SCRIPT_PATH } from "@/lib/github-pages";
import {
  createContentSecurityPolicy,
  defaultSecurityPolicyOptions,
  sanitizeContentSecurityPolicyForMeta,
} from "../../security-headers.mjs";
import AppErrorBoundary from "./AppErrorBoundary";
import HashScrollEffect from "./HashScrollEffect";

const contentSecurityPolicy = createContentSecurityPolicy(
  defaultSecurityPolicyOptions,
);
const metaContentSecurityPolicy = sanitizeContentSecurityPolicyForMeta(
  contentSecurityPolicy,
);

export const metadata: Metadata = {
  title: {
    default: "Planner",
    template: "%s · Planner",
  },
  description: "Local-first planner for organizing tasks and goals",
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: resolveTokenColor(tokens.background),
    },
    {
      media: "(prefers-color-scheme: light)",
      color: resolveTokenColor(tokens.background),
    },
  ],
};

/**
 * No-flash bootstrap:
 * - Reads stored theme via namespaced key
 * - Falls back to system preference
 * - Applies appropriate theme classes
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initializeObservability();

  const depthThemeState = depthThemeEnabled;
  const organicDepthState = organicDepthEnabled;
  const glitchLandingState = glitchLandingEnabled;
  const depthThemeDataAttribute = depthThemeState ? "enabled" : "legacy";
  const organicDepthDataAttribute = organicDepthState ? "organic" : "legacy";
  const glitchLandingDataAttribute = glitchLandingState ? "enabled" : "legacy";
  const buildYear = new Date().getUTCFullYear();
  const basePath = getBasePath();
  const noiseAssetPath = withBasePath("/noise.svg");
  const glitchAssetPath = withBasePath("/glitch-gif.gif");
  const assetUrlCss = [
    ":root {",
    `  --asset-noise-path: "${noiseAssetPath}";`,
    `  --asset-noise-url: url("${noiseAssetPath}");`,
    `  --asset-glitch-gif-path: "${glitchAssetPath}";`,
    `  --asset-glitch-gif-url: url("${glitchAssetPath}");`,
    "}",
  ].join("\n");
  const bodyClassName = `${geistSansVariable} ${geistMonoVariable} ${geistSansClassName} min-h-screen bg-background text-foreground${
    glitchLandingState ? " glitch-root" : ""
  }`;

  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html
      lang="en"
      className="theme-lg color-scheme-dark"
      data-depth-theme={depthThemeDataAttribute}
      data-organic-depth={organicDepthDataAttribute}
      data-glitch-landing={glitchLandingDataAttribute}
      data-base-path={basePath || undefined}
      suppressHydrationWarning
    >
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={metaContentSecurityPolicy}
        />
        <meta name="color-scheme" content="dark light" />
        <style
          id="asset-url-overrides"
          dangerouslySetInnerHTML={{ __html: assetUrlCss }}
        />
        <Script
          id="github-pages-bootstrap"
          strategy="beforeInteractive"
          src={withBasePath(GITHUB_PAGES_BOOTSTRAP_SCRIPT_PATH)}
        />
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          src={withBasePath(THEME_BOOTSTRAP_SCRIPT_PATH)}
        />
      </head>
      <body
        className={bodyClassName}
        data-depth-theme={depthThemeDataAttribute}
        data-organic-depth={organicDepthDataAttribute}
        data-glitch-landing={glitchLandingDataAttribute}
      >
        {/* Preload mono extras without affecting the base body font */}
        <span
          aria-hidden="true"
          className={geistMonoClassName}
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          .
        </span>
        <SkipLink targetId="page-main" />
        <noscript>
          <div
            role="status"
            className="w-full border-b border-border bg-surface px-[var(--space-4)] py-[var(--space-2)] text-center text-ui font-medium text-foreground"
          >
            Animations stay optional—Planner works fully without JavaScript.
          </div>
        </noscript>
          <StyledJsxRegistry>
            <AppErrorBoundary>
              <ThemeProvider glitchLandingEnabled={glitchLandingState}>
                <DepthThemeProvider
                  enabled={depthThemeState}
                  organicDepthEnabled={organicDepthState}
                >
                  <div aria-hidden className="page-backdrop">
                    <PageShell>
                      <DecorLayer className="page-backdrop__layer" variant="grid" />
                      <DecorLayer className="page-backdrop__layer" variant="drip" />
                    </PageShell>
                  </div>
                  <div className="flex min-h-screen flex-col">
                    <SiteChrome>
                      <Suspense fallback={null}>
                        <HashScrollEffect />
                      </Suspense>
                      <CatCompanion />
                      <div
                        id="scroll-root"
                        className="min-h-0 flex-1 overflow-y-auto"
                      >
                        <div className="relative z-10">
                          <div id="page-shell-root">
                            {children}
                          </div>
                          <footer
                            role="contentinfo"
                            className="mt-[var(--space-8)] border-t border-border bg-surface"
                          >
                            <PageShell className="flex flex-col gap-[var(--space-1)] py-[var(--space-5)] text-label text-muted-foreground md:flex-row md:items-center md:justify-between">
                              <p className="text-ui font-medium text-foreground">
                                Planner keeps local-first goals organized so every ritual stays actionable.
                              </p>
                              <p>
                                © <FooterYear buildYear={buildYear} /> Planner Labs. All
                                rights reserved.
                              </p>
                            </PageShell>
                          </footer>
                        </div>
                      </div>
                    </SiteChrome>
                  </div>
                </DepthThemeProvider>
              </ThemeProvider>
            </AppErrorBoundary>
          </StyledJsxRegistry>
      </body>
    </html>
  );
}
