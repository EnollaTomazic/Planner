// src/components/ui/layout/NeomorphicFrameStyles.tsx
"use client";

import * as React from "react";

export function NeomorphicFrameStyles() {
  return (
    <style jsx global>{`
      .hero2-neomorph {
        background: linear-gradient(
          145deg,
          hsl(var(--card)),
          hsl(var(--panel))
        );
        --hero2-shadow-key: var(--shadow);
        --hero2-shadow-ambient: inset 0 0 0 calc(var(--hairline-w) * 1.5)
          hsl(var(--shadow-color) / 0.18);
        box-shadow: var(--hero2-shadow-ambient), var(--hero2-shadow-key);
      }
      @supports (color: color-mix(in oklab, white, black)) {
        .hero2-neomorph {
          --hero2-shadow-ambient: inset 0 0 0 calc(var(--hairline-w) * 1.5)
            color-mix(
              in oklab,
              hsl(var(--shadow-color)) 28%,
              hsl(var(--highlight))
            );
        }
      }
      @media (prefers-contrast: more) {
        .hero2-frame {
          border-color: hsl(var(--foreground) / 0.7) !important;
        }
        .hero2-neomorph {
          --hero2-shadow-key: 0 0 var(--space-4)
            hsl(var(--foreground) / 0.75);
          --hero2-shadow-ambient: inset 0 0 0 calc(var(--hairline-w) * 2)
            hsl(var(--foreground) / 0.7);
          box-shadow: var(--hero2-shadow-ambient), var(--hero2-shadow-key);
        }
      }
      @media (forced-colors: active) {
        .hero2-frame {
          border-color: CanvasText !important;
          background: Canvas !important;
        }
        .hero2-neomorph {
          background: Canvas !important;
          box-shadow: none !important;
        }
      }
    `}</style>
  );
}
