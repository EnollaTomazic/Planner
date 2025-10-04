// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";
import "@/env/validate-server-env";

import type { Metadata, Viewport } from "next";
import {
  geistMonoVariable,
  geistSansClassName,
  geistSansVariable,
} from "./fonts";
import tokens from "../../tokens/tokens.js";
import { resolveTokenColor } from "@/lib/color";
import SiteChrome from "@/components/chrome/SiteChrome";
import { CatCompanion, DecorLayer, PageShell, SkipLink } from "@/components/ui";
import { withBasePath } from "@/lib/utils";
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
} from "../../security-headers.mjs";

const contentSecurityPolicy = createContentSecurityPolicy(
  defaultSecurityPolicyOptions,
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
  const year = new Date().getFullYear();
  const assetUrlCss = [
    ":root {",
    `  --asset-noise-url: url("${withBasePath("/noise.svg")}");`,
    `  --asset-glitch-gif-url: url("${withBasePath("/glitch-gif.gif")}");`,
    "}",
  ].join("\n");

  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html
      lang="en"
      className="theme-lg color-scheme-dark"
      data-depth-theme={depthThemeDataAttribute}
      data-organic-depth={organicDepthDataAttribute}
      data-glitch-landing={glitchLandingDataAttribute}
      suppressHydrationWarning
    >
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={contentSecurityPolicy}
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
        className={`${geistSansClassName} ${geistSansVariable} ${geistMonoVariable} min-h-screen bg-background text-foreground${glitchLandingState ? " glitch-root" : ""}`}
        data-depth-theme={depthThemeDataAttribute}
        data-organic-depth={organicDepthDataAttribute}
        data-glitch-landing={glitchLandingDataAttribute}
      >
        <SkipLink targetId="main-content" />
        <noscript>
          <div
            role="status"
            className="w-full border-b border-border bg-surface px-[var(--space-4)] py-[var(--space-2)] text-center text-ui font-medium text-foreground"
          >
            Animations stay optional—Planner works fully without JavaScript.
          </div>
        </noscript>
        <StyledJsxRegistry>
          <ThemeProvider glitchLandingEnabled={glitchLandingState}>
            <DepthThemeProvider
              enabled={depthThemeState}
              organicDepthEnabled={organicDepthState}
            >
              <div aria-hidden className="page-backdrop">
                <div className="page-shell">
                  <DecorLayer className="page-backdrop__layer" variant="grid" />
                  <DecorLayer className="page-backdrop__layer" variant="drip" />
                </div>
              </div>
              <SiteChrome>
                <CatCompanion />
                <div className="relative z-10">
                  <main id="main-content" role="main" tabIndex={-1}>
                    {children}
                  </main>
                  <footer
                    role="contentinfo"
                    className="mt-[var(--space-8)] border-t border-border bg-surface"
                  >
                    <PageShell className="flex flex-col gap-[var(--space-1)] py-[var(--space-5)] text-label text-muted-foreground md:flex-row md:items-center md:justify-between">
                      <p className="text-ui font-medium text-foreground">
                        Planner keeps local-first goals organized so every ritual stays actionable.
                      </p>
                      <p>© {year} Planner Labs. All rights reserved.</p>
                    </PageShell>
                  </footer>
                </div>
              </SiteChrome>
            </DepthThemeProvider>
          </ThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
