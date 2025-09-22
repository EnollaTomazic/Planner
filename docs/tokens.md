| Token | Value |
| --- | --- |
| background | 246 35% 7% |
| foreground | 260 20% 96% |
| text | var(--foreground) |
| card | 248 30% 10% |
| card-foreground | var(--foreground) |
| panel | var(--card) |
| border | 252 20% 22% |
| line | var(--border) |
| input | 250 22% 12% |
| ring | 262 83% 65% |
| theme-ring | hsl(var(--ring)) |
| primary | 262 83% 58% |
| primary-foreground | 0 0% 100% |
| primary-soft | 262 83% 18% |
| accent | 292 90% 43% |
| accent-2 | 192 90% 30% |
| accent-3 | 192 90% 32% |
| accent-foreground | 0 0% 100% |
| accent-soft | 292 90% 30% |
| highlight | 0 0% 100% |
| glow | 292 95% 52% |
| ring-muted | 248 20% 22% |
| danger | 0 84% 60% |
| warning | 43 96% 56% |
| warning-soft | var(--warning) / 0.1 |
| warning-soft-strong | var(--warning) / 0.2 |
| muted | 248 26% 14% |
| muted-foreground | 250 15% 70% |
| surface | 248 24% 12% |
| surface-2 | 248 24% 16% |
| surface-vhs | 210 27% 6% |
| surface-streak | 240 16% 12% |
| shadow-color | 262 83% 58% |
| lav-deep | 320 85% 60% |
| team-blue | 200 100% 60% |
| team-red | 0 85% 60% |
| noir-background | 350 70% 4% |
| noir-foreground | 0 0% 92% |
| noir-border | 350 40% 22% |
| hardstuck-background | 165 60% 3% |
| hardstuck-foreground | 160 12% 95% |
| hardstuck-border | 165 40% 22% |
| success | 160 70% 45% |
| success-soft | var(--success) / 0.2 |
| success-glow | 160 70% 35% / 0.6 |
| tone-top | 38 92% 60% |
| tone-jg | 152 52% 44% |
| tone-mid | 265 72% 62% |
| tone-bot | 195 75% 56% |
| tone-sup | 320 72% 60% |
| aurora-g | var(--accent-2) |
| aurora-g-light | color-mix(in oklab, hsl(var(--accent-2)) 37.5%, white) |
| aurora-p | var(--accent) |
| aurora-p-light | color-mix(in oklab, hsl(var(--accent)) 37.5%, white) |
| icon-fg | 247 100% 77% |
| accent-overlay | hsl(var(--accent)) |
| ring-contrast | hsl(var(--ring)) |
| glow-active | hsl(var(--glow)) |
| text-on-accent | hsl(var(--foreground)) |
| neon | var(--glow) |
| neon-soft | hsl(var(--neon)) |
| btn-bg | transparent |
| btn-fg | hsl(var(--foreground)) |
| hover | hsl(var(--foreground) / 0.08) |
| focus | hsl(var(--ring)) |
| active | hsl(var(--foreground) / 0.12) |
| disabled | 0.5 |
| loading | 0.6 |
| card-hairline | hsl(var(--border)) |
| hairline-w | 1px |
| ease-out | cubic-bezier(0.16, 1, 0.3, 1) |
| ease-snap | cubic-bezier(0.2, 0.8, 0.2, 1) |
| dur-quick | 140ms |
| dur-chill | 220ms |
| dur-slow | 420ms |
| control-h-xs | 24px |
| control-h-sm | 32px |
| control-h-md | 40px |
| control-h-lg | 48px |
| control-h-xl | 56px |
| control-h | var(--control-h-md) |
| control-radius | var(--radius-xl) |
| control-fs | var(--font-ui) |
| control-px | var(--spacing-3) |
| header-stack | calc(var(--spacing-8) + var(--spacing-4)) |
| edge-iris | conic-gradient(
    from 180deg,
    hsl(262 83% 58% / 0),
    hsl(262 83% 58% / 0.7),
    hsl(var(--accent-3) / 0.7),
    hsl(320 85% 60% / 0.7),
    hsl(262 83% 58% / 0)
  ) |
| seg-active-grad | linear-gradient(
    90deg,
    hsl(var(--primary-soft) / 0.85),
    hsl(var(--accent-soft) / 0.85),
    hsl(var(--accent-2) / 0.8)
  ) |
| seg-active-base | hsl(var(--card)) |
| shadow | 0 10px 30px hsl(250 30% 2% / 0.35) |
| shadow-neo-sm | calc(var(--spacing-1)) calc(var(--spacing-1)) calc(var(--spacing-2))
      hsl(var(--panel) / 0.72),
    calc(var(--spacing-1) * -1) calc(var(--spacing-1) * -1) calc(var(--spacing-2))
      hsl(var(--foreground) / 0.06) |
| shadow-neo | calc(var(--spacing-3)) calc(var(--spacing-3)) var(--spacing-5)
      hsl(var(--panel) / 0.72),
    calc(var(--spacing-3) * -1) calc(var(--spacing-3) * -1) var(--spacing-5)
      hsl(var(--foreground) / 0.06) |
| shadow-neo-strong | var(--spacing-4) var(--spacing-4) var(--spacing-6) hsl(var(--panel) / 0.72),
    calc(var(--spacing-4) * -1) calc(var(--spacing-4) * -1) var(--spacing-6)
      hsl(var(--foreground) / 0.08) |
| shadow-neo-inset | inset var(--spacing-1) var(--spacing-1) var(--spacing-3)
      hsl(var(--panel) / 0.85),
    inset calc(var(--spacing-1) * -1) calc(var(--spacing-1) * -1) var(--spacing-3)
      hsl(var(--foreground) / 0.08) |
| shadow-ring | 0 0 var(--spacing-3) hsl(var(--ring)) |
| shadow-neo-soft | 0 var(--spacing-1) var(--spacing-3) calc(var(--spacing-1) * -1)
      hsl(var(--shadow-color)) |
| shadow-glow-sm | 0 0 var(--spacing-2) var(--glow-active) |
| shadow-glow-md | 0 0 var(--spacing-4) var(--glow-active) |
| shadow-glow-lg | 0 0 var(--spacing-5) var(--glow-active) |
| shadow-glow-xl | 0 var(--spacing-2) var(--spacing-6) var(--glow-active) |
| shadow-nav-active | 0 0 0 var(--hairline-w) hsl(var(--ring) / 0.35),
    0 var(--spacing-2) var(--spacing-6) hsl(var(--ring) / 0.2) |
| shadow-outline-subtle | 0 0 0 var(--hairline-w) hsl(var(--border) / 0.12) |
| shadow-outline-faint | 0 0 0 var(--hairline-w) hsl(var(--border) / 0.08) |
| shadow-badge | inset 0 var(--hairline-w) 0 hsl(var(--foreground) / 0.06),
    0 0 0 var(--hairline-w) hsl(var(--card-hairline) / 0.35),
    0 var(--spacing-3) var(--spacing-4) hsl(var(--shadow-color) / 0.18) |
| shadow-inset-contrast | inset 0 0 0 var(--hairline-w) var(--ring-contrast) |
| shadow-inset-hairline | inset 0 0 0 var(--hairline-w) hsl(var(--card-hairline)) |
| shadow-glow-current | 0 0 var(--spacing-2) currentColor |
| shadow-neon-soft | 0 0 var(--spacing-2) var(--neon),
    0 0 var(--spacing-4) var(--neon-soft) |
| shadow-neon-strong | 0 0 var(--spacing-3) var(--neon),
    0 0 var(--spacing-5) var(--neon-soft) |
| shadow-control | inset 0 var(--spacing-1) var(--spacing-2) 0 rgb(0 0 0 / 0.06),
    0 0 0 var(--hairline-w) hsl(var(--border) / 0.12) |
| shadow-control-hover | 0 var(--spacing-1) var(--spacing-2) hsl(var(--shadow-color) / 0.3) |
| lg-violet | var(--ring) |
| lg-cyan | var(--accent-2) |
| lg-pink | var(--lav-deep) |
| lg-black | var(--background) |
| glow-strong | var(--ring) / 0.55 |
| glow-soft | var(--accent) / 0.25 |
| space-1 | var(--spacing-1) |
| space-2 | var(--spacing-2) |
| space-3 | var(--spacing-3) |
| space-4 | var(--spacing-4) |
| space-5 | var(--spacing-5) |
| space-6 | var(--spacing-6) |
| space-7 | var(--spacing-7) |
| space-8 | var(--spacing-8) |
| font-size-md | var(--font-body) |
| font-weight-bold | 800 |
| shadow-neon | 0 0 var(--space-1) hsl(var(--neon) / 0.55),
    0 0 calc(var(--space-3) - var(--space-1) / 2) hsl(var(--neon) / 0.35),
    0 0 calc(var(--space-4) + var(--space-1) / 2) hsl(var(--neon) / 0.2) |
| font-label | 12px |
| font-ui | 15px |
| font-body | 19px |
| font-title | 24px |
| font-title-lg | 30px |
| btn-primary-hover-shadow | 0 calc(var(--space-1) / 2) calc(var(--space-3) / 2)
    calc(-1 * var(--space-1) / 4) hsl(var(--accent) / 0.25) |
| btn-primary-active-shadow | inset 0 0 0 calc(var(--space-1) / 4)
    hsl(var(--accent) / 0.6) |
| pillar-wave-start | 257 90% 70% |
| pillar-wave-end | 198 90% 62% |
| pillar-wave-shadow | 258 90% 38% / 0.35 |
| pillar-trading-start | 292 85% 72% |
| pillar-trading-end | 318 85% 66% |
| pillar-trading-shadow | 292 85% 38% / 0.35 |
| pillar-vision-start | 157 70% 55% |
| pillar-vision-end | 192 75% 60% |
| pillar-vision-shadow | 170 70% 30% / 0.35 |
| pillar-tempo-start | 260 85% 70% |
| pillar-tempo-end | 284 85% 65% |
| pillar-tempo-shadow | 270 80% 35% / 0.35 |
| pillar-positioning-start | 190 90% 66% |
| pillar-positioning-end | 220 90% 66% |
| pillar-positioning-shadow | 205 85% 35% / 0.35 |
| pillar-comms-start | 286 90% 68% |
| pillar-comms-end | 312 88% 66% |
| pillar-comms-shadow | 300 80% 36% / 0.35 |
| card-overlay-scanlines | repeating-linear-gradient(
    to bottom,
    hsl(var(--foreground) / 0.035) 0,
    hsl(var(--foreground) / 0.035) var(--spacing-0-25),
    transparent var(--spacing-0-5),
    transparent calc(var(--spacing-0-5) + var(--spacing-0-25))
  ) |
| hero-divider-blur | calc(var(--spacing-1) * 1.5) |
| spacing-0-125 | calc(var(--spacing-1) / 8) |
| spacing-0-25 | calc(var(--spacing-1) / 4) |
| spacing-0-5 | calc(var(--spacing-1) / 2) |
| spacing-0-75 | calc(var(--spacing-1) * 0.75) |
| spacing-1 | 4px |
| spacing-2 | 8px |
| spacing-3 | 12px |
| spacing-4 | 16px |
| spacing-5 | 24px |
| spacing-6 | 32px |
| spacing-7 | 48px |
| spacing-8 | 64px |
| radius-md | 8px |
| radius-lg | 12px |
| radius-xl | 16px |
| radius-2xl | 24px |
| radius-full | 9999px |