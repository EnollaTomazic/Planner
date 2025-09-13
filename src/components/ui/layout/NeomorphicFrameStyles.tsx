// src/components/ui/layout/NeomorphicFrameStyles.tsx
"use client";

import * as React from "react";

export function NeomorphicFrameStyles() {
  return (
    <style jsx global>{`
      .hero2-beams {
        position: absolute;
        inset: calc(var(--space-1) / -2);
        border-radius: var(--radius-2xl);
        z-index: 0;
        pointer-events: none;
        background:
          linear-gradient(
              100deg,
              transparent 0%,
              hsl(var(--primary) / 0.18) 10%,
              transparent 22%
            )
            0 0/100% 100%,
          linear-gradient(
              260deg,
              transparent 0%,
              hsl(var(--accent) / 0.2) 8%,
              transparent 20%
            )
            0 0/100% 100%;
        mix-blend-mode: screen;
        animation: hero2-beam-pan 7s linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .hero2-beams {
          animation: none;
        }
      }
      @keyframes hero2-beam-pan {
        0% {
          transform: translateX(-3%);
        }
        50% {
          transform: translateX(3%);
        }
        100% {
          transform: translateX(-3%);
        }
      }
      .hero2-scanlines {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background:
          linear-gradient(
            transparent 94%,
            hsl(var(--foreground) / 0.5) 96%,
            transparent 98%
          ),
          linear-gradient(
            90deg,
            transparent 94%,
            hsl(var(--foreground) / 0.4) 96%,
            transparent 98%
          );
        background-size:
          100% calc(var(--space-4) - var(--space-1) / 2),
          calc(var(--space-4) - var(--space-1) / 2) 100%;
        opacity: 0.07;
        animation: hero2-scan-move 6s linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .hero2-scanlines {
          animation: none;
        }
      }
      @keyframes hero2-scan-move {
        0% {
          background-position:
            0 0,
            0 0;
        }
        100% {
          background-position:
            0 calc(var(--space-4) - var(--space-1) / 2),
            calc(var(--space-4) - var(--space-1) / 2) 0;
        }
      }
      .hero2-noise {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        opacity: 0.03;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml;utf8,\
        <svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
          <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>\
          <rect width='100%' height='100%' filter='url(%23n)' opacity='0.38'/></svg>");
        background-size: calc(var(--space-8) * 4 + var(--space-5))
          calc(var(--space-8) * 4 + var(--space-5));
        animation: hero2-noise-shift 1.8s steps(2, end) infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .hero2-noise {
          animation: none;
          background-position: 0 0;
        }
      }
      @keyframes hero2-noise-shift {
        50% {
          background-position: 50% 50%;
        }
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
    `}</style>
  );
}
