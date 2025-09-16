// src/components/ui/layout/NeomorphicFrameStyles.tsx
"use client";

import * as React from "react";

export function NeomorphicFrameStyles() {
  return (
    <style jsx global>{`
      .hero2-beams {
        position: absolute;
        inset: var(--space-1);
        border-radius: calc(var(--radius-2xl) - var(--space-1) / 2);
        z-index: 0;
        pointer-events: none;
        background: linear-gradient(
          150deg,
          hsl(var(--highlight) / 0.16),
          hsl(var(--accent) / 0.08) 45%,
          hsl(var(--ring) / 0.06)
        );
      }
      .hero2-scanlines,
      .hero2-noise {
        display: none !important;
      }
      .hero2-neomorph {
        background: linear-gradient(
          145deg,
          hsl(var(--card)),
          hsl(var(--panel))
        );
        box-shadow:
          inset var(--space-1) var(--space-1) var(--space-2)
            hsl(var(--background) / 0.55),
          inset calc(-1 * var(--space-1)) calc(-1 * var(--space-1))
            var(--space-2) hsl(var(--highlight) / 0.05),
          0 0 var(--space-4) hsl(var(--ring) / 0.25);
      }
      @media (prefers-contrast: more) {
        .hero2-beams,
        .hero2-scanlines,
        .hero2-noise {
          display: none !important;
        }
        .hero2-frame {
          border-color: hsl(var(--foreground) / 0.7) !important;
        }
        .hero2-neomorph {
          box-shadow:
            inset var(--space-1) var(--space-1) var(--space-2)
              hsl(var(--background) / 0.65),
            inset calc(-1 * var(--space-1)) calc(-1 * var(--space-1))
              var(--space-2) hsl(var(--highlight) / 0.08),
            0 0 0 1px hsl(var(--ring) / 0.7),
            0 0 var(--space-5) hsl(var(--ring) / 0.5);
        }
      }
      @media (forced-colors: active) {
        .hero2-beams,
        .hero2-scanlines,
        .hero2-noise {
          display: none !important;
        }
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
