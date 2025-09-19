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
| ring | 262 83% 58% |
| theme-ring | hsl(var(--ring)) |
| primary | 262 83% 58% |
| primary-foreground | 0 0% 100% |
| primary-soft | 262 83% 18% |
| accent | 292 90% 35% |
| accent-2 | 192 100% 25% |
| accent-3 | 192 90% 50% |
| accent-foreground | 0 0% 100% |
| accent-soft | 292 90% 15% |
| highlight | 0 0% 100% |
| glow | 292 90% 35% |
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
| motion-easing-standard | cubic-bezier(0.16, 1, 0.3, 1) |
| motion-easing-entrance | cubic-bezier(0.2, 0.8, 0.2, 1) |
| motion-easing-exit | cubic-bezier(0.4, 0, 1, 1) |
| motion-duration-100 | 100ms |
| motion-duration-200 | 200ms |
| motion-duration-300 | 300ms |
| motion-duration-500 | 500ms |
| control-h-sm | 36px |
| control-h-md | 40px |
| control-h-lg | 44px |
| control-h | var(--control-h-md) |
| control-radius | var(--radius-xl) |
| control-fs | 0.9rem |
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
| lg-violet | var(--ring) |
| lg-cyan | var(--accent-2) |
| lg-pink | var(--lav-deep) |
| lg-black | var(--background) |
| glow-strong | var(--ring) / 0.55 |
| glow-soft | var(--accent) / 0.25 |
| space-0-125 | calc(var(--spacing-1) / 8) |
| space-0-25 | calc(var(--spacing-1) / 4) |
| space-0-5 | calc(var(--spacing-1) / 2) |
| space-0-75 | calc(var(--spacing-1) * 0.75) |
| space-1 | var(--spacing-1) |
| space-2 | var(--spacing-2) |
| space-3 | var(--spacing-3) |
| space-4 | var(--spacing-4) |
| space-5 | var(--spacing-5) |
| space-6 | var(--spacing-6) |
| space-7 | var(--spacing-7) |
| space-8 | var(--spacing-8) |
| font-size-md | 20px |
| font-weight-bold | 800 |
| shadow-neon | 0 0 var(--space-1) hsl(var(--neon) / 0.55),
    0 0 calc(var(--space-3) - var(--space-1) / 2) hsl(var(--neon) / 0.35),
    0 0 calc(var(--space-4) + var(--space-1) / 2) hsl(var(--neon) / 0.2) |
| font-label | 12px |
| font-ui | 14px |
| font-body | 16px |
| font-title | 20px |
| font-title-lg | 24px |
| btn-primary-hover-shadow | 0 calc(var(--space-1) / 2) calc(var(--space-3) / 2)
    calc(-1 * var(--space-1) / 4) hsl(var(--accent) / 0.25) |
| btn-primary-active-shadow | inset 0 0 0 calc(var(--space-1) / 4)
    hsl(var(--accent) / 0.6) |
| destructive | var(--danger) |
| destructive-foreground | var(--danger-foreground) |
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