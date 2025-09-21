// src/components/ui/layout/hero/HeroGlitchStyles.tsx

import * as React from "react";

export function HeroGlitchStyles() {
  return (
    <style jsx global>{`
      /* === Glitch title ================================================== */
      .hero2-title {
        position: relative;
      }
      .hero2-title::before,
      .hero2-title::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
        clip-path: inset(0 0 0 0);
        opacity: 0.75;
      }
      .hero2-title::before {
        transform: translate(
          calc(var(--hairline-w) / 2),
          calc(-1 * var(--hairline-w) / 2)
        );
        color: hsl(var(--accent-2) / 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-a 2.4s infinite steps(8, end);
      }
      .hero2-title::after {
        transform: translate(
          calc(-1 * var(--hairline-w) / 2),
          calc(var(--hairline-w) / 2)
        );
        color: hsl(var(--lav-deep) / 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-b 2.4s infinite steps(9, end);
      }
      @keyframes hero2-glitch-a {
        0% {
          clip-path: inset(0);
        }
        10% {
          clip-path: inset(0 0 8% 0);
        }
        20% {
          clip-path: inset(60% 0 0 0);
        }
        40% {
          clip-path: inset(30% 0 40% 0);
        }
        80% {
          clip-path: inset(10% 0 70% 0);
        }
        100% {
          clip-path: inset(0);
        }
      }
      @keyframes hero2-glitch-b {
        0% {
          clip-path: inset(0);
        }
        15% {
          clip-path: inset(70% 0 10% 0);
        }
        55% {
          clip-path: inset(0 0 60% 0);
        }
        95% {
          clip-path: inset(20% 0 30% 0);
        }
        100% {
          clip-path: inset(0);
        }
      }

      /* === HUD Tabs container (legacy hook, optional) ==================== */
      .tabs-hud {
        background: transparent;
        box-shadow: none;
      }

      /* === Neon divider (unchanged) ===================================== */
      .hero2-divider-glow {
        filter: blur(var(--hero-divider-blur, calc(var(--spacing-1) * 1.5)));
      }
      .neon-primary {
        --neon: var(--primary);
      }
      .neon-life {
        --neon: var(--accent);
      }
      @media (prefers-contrast: more) {
        .hero2-divider-line {
          background-color: hsl(var(--foreground)) !important;
          opacity: 0.85 !important;
        }
        .hero2-divider-glow {
          background-color: hsl(var(--foreground)) !important;
          opacity: 0.9 !important;
          filter: none !important;
        }
      }
      @media (forced-colors: active) {
        .hero2-divider-line {
          background-color: CanvasText !important;
          opacity: 1 !important;
        }
        .hero2-divider-glow {
          display: none !important;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero2-title::before,
        .hero2-title::after {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}

