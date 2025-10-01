// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";

import type { Metadata, Viewport } from "next";
import {
  geistMonoVariable,
  geistSansClassName,
  geistSansVariable,
} from "./fonts";
import tokens from "../../tokens/tokens.js";
import { resolveTokenColor } from "@/lib/color";
import SiteChrome from "@/components/chrome/SiteChrome";
import { CatCompanion, DecorLayer, PageShell } from "@/components/ui";
import { withBasePath } from "@/lib/utils";
import Script from "next/script";
import ThemeProvider from "@/lib/theme-context";
import { THEME_BOOTSTRAP_SCRIPT_PATH } from "@/lib/theme";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";
import DepthThemeProvider from "@/lib/depth-theme-context";
import {
  depthThemeEnabled,
  glitchLandingEnabled,
  organicDepthEnabled,
} from "@/lib/features";

const createNonceInitializer = (nonce: string): string => {
  const nonceValue = JSON.stringify(nonce);
  return [
    "(() => {",
    `  var nonce = ${nonceValue};`,
    "  if (!nonce) return;",
    "  var globalObject = typeof globalThis !== \"undefined\" ? globalThis : window;",
    "  if (globalObject.__plannerNoncePatched) return;",
    "  globalObject.__plannerNoncePatched = true;",
    "  globalObject.__webpack_nonce__ = nonce;",
    "  if (typeof globalObject.__next_require__ === \"function\") {",
    "    globalObject.__next_require__.nc = nonce;",
    "  }",
    "  if (typeof globalObject.__webpack_require__ === \"function\") {",
    "    globalObject.__webpack_require__.nc = nonce;",
    "  }",
    "  var toLowerCase = function (value) {",
    "    return typeof value === \"string\" ? value.toLowerCase() : \"\";",
    "  };",
    "  var isScriptTag = function (tagName) {",
    "    return toLowerCase(tagName) === \"script\";",
    "  };",
    "  var applyNonce = function (node) {",
    "    if (!node || typeof node !== \"object\") return;",
    "    var element = node;",
    "    if (!element.tagName || typeof element.tagName !== \"string\") return;",
    "    if (!element.getAttribute || typeof element.getAttribute !== \"function\") return;",
    "    if (!isScriptTag(element.tagName)) return;",
    "    var existing = element.getAttribute(\"nonce\");",
    "    if (existing === nonce) return;",
    "    if (existing && existing !== nonce) return;",
    "    element.setAttribute(\"nonce\", nonce);",
    "  };",
    "  var documentRef = globalObject.document;",
    "  if (!documentRef) return;",
    "  var originalCreateElement = documentRef.createElement;",
    "  documentRef.createElement = function () {",
    "    var element = originalCreateElement.apply(this, arguments);",
    "    var name = arguments.length > 0 ? arguments[0] : undefined;",
    "    if (typeof name === \"string\" && isScriptTag(name)) {",
    "      applyNonce(element);",
    "    }",
    "    return element;",
    "  };",
    "  var originalCreateElementNS = documentRef.createElementNS;",
    "  if (originalCreateElementNS) {",
    "    documentRef.createElementNS = function () {",
    "      var element = originalCreateElementNS.apply(this, arguments);",
    "      var name = arguments.length > 1 ? arguments[1] : undefined;",
    "      if (typeof name === \"string\" && isScriptTag(name)) {",
    "        applyNonce(element);",
    "      }",
    "      return element;",
    "    };",
    "  }",
    "  var originalSetAttribute = Element.prototype.setAttribute;",
    "  Element.prototype.setAttribute = function (name, value) {",
    "    originalSetAttribute.apply(this, arguments);",
    "    if (typeof this.tagName === \"string\" && isScriptTag(this.tagName) && name === \"nonce\" && this.nonce !== value) {",
    "      this.nonce = value;",
    "    }",
    "  };",
    "  var scriptNodes = documentRef.getElementsByTagName(\"script\");",
    "  for (var index = 0; index < scriptNodes.length; index++) {",
    "    applyNonce(scriptNodes[index]);",
    "  }",
    "  var observer = new MutationObserver(function (records) {",
    "    for (var i = 0; i < records.length; i++) {",
    "      var added = records[i].addedNodes;",
    "      for (var j = 0; j < added.length; j++) {",
    "        applyNonce(added[j]);",
    "      }",
    "    }",
    "  });",
    "  observer.observe(documentRef.documentElement, { childList: true, subtree: true });",
    "  applyNonce(documentRef.currentScript);",
    "})();",
  ].join("\n");
};

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
  const depthThemeState = depthThemeEnabled;
  const organicDepthState = organicDepthEnabled;
  const glitchLandingState = glitchLandingEnabled;
  const depthThemeDataAttribute = depthThemeState ? "enabled" : "legacy";
  const organicDepthDataAttribute = organicDepthState ? "organic" : "legacy";
  const glitchLandingDataAttribute = glitchLandingState ? "enabled" : "legacy";
  const year = new Date().getFullYear();
  const assetUrlCss = [
    ":root {",
    `  --asset-noise-url: url(\"${withBasePath("/noise.svg")}\");`,
    `  --asset-glitch-gif-url: url(\"${withBasePath("/glitch-gif.gif")}\");`,
    "}",
  ].join("\n");
  const renderLayout = (nonce?: string) => {
    const nonceInitializer = nonce ? createNonceInitializer(nonce) : null;
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
          {nonce ? <meta property="csp-nonce" content={nonce} /> : null}
          <meta name="color-scheme" content="dark light" />
          <style
            id="asset-url-overrides"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: assetUrlCss }}
          />
          {nonceInitializer ? (
            <Script
              id="csp-nonce-runtime"
              strategy="beforeInteractive"
              nonce={nonce}
              dangerouslySetInnerHTML={{ __html: nonceInitializer }}
            />
          ) : null}
          <Script
            id="theme-bootstrap"
            strategy="beforeInteractive"
            nonce={nonce}
            src={withBasePath(THEME_BOOTSTRAP_SCRIPT_PATH)}
          />
        </head>
        <body
          className={`${geistSansClassName} ${geistSansVariable} ${geistMonoVariable} min-h-screen bg-background text-foreground${glitchLandingState ? " glitch-root" : ""}`}
          data-depth-theme={depthThemeDataAttribute}
          data-organic-depth={organicDepthDataAttribute}
          data-glitch-landing={glitchLandingDataAttribute}
        >
          <a
            className="fixed left-[var(--space-4)] top-[var(--space-4)] z-50 inline-flex items-center rounded-[var(--radius-lg)] bg-background px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium text-foreground shadow-outline-subtle outline-none transition-all duration-quick ease-out opacity-0 -translate-y-full pointer-events-none focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:shadow-ring focus-visible:no-underline focus-visible:outline-none hover:shadow-ring focus-visible:active:translate-y-[var(--space-1)]"
            href="#main-content"
          >
            Skip to main content
          </a>
          <noscript>
            <div
              role="status"
              className="w-full border-b border-border bg-surface px-[var(--space-4)] py-[var(--space-2)] text-center text-ui font-medium text-foreground"
            >
              Animations stay optional—Planner works fully without JavaScript.
            </div>
          </noscript>
          <StyledJsxRegistry nonce={nonce}>
            <ThemeProvider glitchLandingEnabled={glitchLandingState}>
              <DepthThemeProvider
                enabled={depthThemeState}
                organicDepthEnabled={organicDepthState}
              >
                <div aria-hidden className="page-backdrop">
                  <div className="page-shell">
                    <DecorLayer
                      className="page-backdrop__layer"
                      variant="grid"
                    />
                    <DecorLayer
                      className="page-backdrop__layer"
                      variant="drip"
                    />
                  </div>
                </div>
                <SiteChrome>
                  <CatCompanion />
                  <div className="relative z-10">
                    <main id="main-content" tabIndex={-1}>
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
  };

  if (
    process.env.GITHUB_PAGES === "true" ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    // Static exports (GitHub Pages, production build prerender) do not provide
    // response headers, so skip reading the nonce in those environments.
    return renderLayout();
  }

  const { headers } = await import("next/headers");
  const nonceHeader = await headers();
  const nonce = nonceHeader.get("x-nonce") ?? undefined;
  return renderLayout(nonce);
}
