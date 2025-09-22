// src/components/ui/layout/NeomorphicFrameStyles.tsx
"use client";

import * as React from "react";

export function NeomorphicFrameStyles() {
  return (
    <style jsx global>{`
      .hero2-frame {
        --hero: var(--card);
        --hero-2: var(--background);
        --control: var(--card);
        --inset: var(--shadow-color);
      }
      @supports (color: color-mix(in oklab, white, black)) {
        .hero2-frame {
          --hero: color-mix(
            in oklab,
            hsl(var(--card)) 78%,
            hsl(var(--background)) 22%
          );
          --hero-2: color-mix(
            in oklab,
            hsl(var(--card)) 54%,
            hsl(var(--shadow-color)) 46%
          );
          --control: color-mix(
            in oklab,
            hsl(var(--card)) 68%,
            hsl(var(--foreground)) 32%
          );
        }
      }
      .hero2-neomorph {
        position: relative;
        background-image: linear-gradient(
          135deg,
          hsl(var(--hero)),
          hsl(var(--hero-2))
        );
        box-shadow: 0 12px 32px hsl(var(--shadow));
      }
      .hero2-neomorph::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 0 0 1px hsl(0 0% 100% / 0.05);
      }
      .hero2-neomorph::after {
        content: none;
      }
      @media (prefers-contrast: more) {
        .hero2-neomorph {
          background-image: linear-gradient(
            135deg,
            hsl(var(--card)),
            hsl(var(--background))
          );
          box-shadow: 0 0 0 1px hsl(var(--foreground) / 0.7);
        }
        .hero2-neomorph::before {
          box-shadow: inset 0 0 0 1px hsl(var(--foreground) / 0.7);
        }
      }
      @media (forced-colors: active) {
        .hero2-neomorph {
          background: Canvas !important;
          box-shadow: none !important;
        }
        .hero2-neomorph::before {
          box-shadow: inset 0 0 0 1px CanvasText !important;
        }
      }
    `}</style>
  );
}
