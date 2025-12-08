'use client'

import * as React from 'react'
import { isLegacyUiEnabled } from '@/lib/useLegacyUi'
import { PageShell as LegacyPageShell } from '@/legacy/ui/layout/PageShell'
import { cn } from '@/lib/utils'

export type PageShellElement =
  | 'div'
  | 'main'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav'

export type PageShellOwnProps<T extends PageShellElement = 'div'> = {
  as?: T
  className?: string
  /**
   * Enables the standardized 12-column grid within the page shell.
   * When set, children should define their own col-span wrappers.
   */
  grid?: boolean
  contentClassName?: string
  /**
   * When true, applies a subtle neon edge and glitch speckle with
   * opacity clamped to 0.06 for accessibility.
   */
  noisy?: boolean
  /**
   * Optional foreground ring accent; defaults to the theme accent.
   */
  ring?: boolean
}

export type PageShellProps<T extends PageShellElement = 'div'> =
  PageShellOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>

const baseShellClassName = cn(
  'page-shell relative isolate overflow-hidden',
  'rounded-[var(--radius-xl)] border border-card-hairline/70 bg-surface/70',
  'shadow-[var(--shadow-inner-sm),var(--depth-shadow-soft)] backdrop-blur-md',
  'space-y-[var(--space-6)] md:space-y-[var(--space-7)] lg:space-y-[var(--space-8)]',
)

export const layoutGridClassName = cn(
  'grid grid-cols-1 gap-x-[var(--space-4)] gap-y-[var(--space-6)]',
  'md:grid-cols-12 md:gap-x-[var(--space-5)] md:gap-y-[var(--space-7)]',
  'lg:gap-x-[var(--space-6)] lg:gap-y-[var(--space-8)]',
)

export function PageShell<T extends PageShellElement = 'div'>({
  as,
  className,
  grid = false,
  contentClassName,
  children,
  noisy = true,
  ring = false,
  ...rest
}: PageShellProps<T>) {
  if (isLegacyUiEnabled()) {
    const LegacyShell = LegacyPageShell as React.ComponentType<Record<string, unknown>>
    return (
      <LegacyShell
        as={as}
        className={className}
        grid={grid}
        contentClassName={contentClassName}
        {...rest}
      >
        {children}
      </LegacyShell>
    )
  }

  const Component = (as ?? 'div') as PageShellElement

  return (
    <Component
      className={cn(baseShellClassName, className)}
      data-glitch={noisy ? 'true' : undefined}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit]',
          'bg-gradient-to-br from-[color:var(--surface-overlay-soft,transparent)] via-transparent to-[color:var(--surface-overlay-strong,transparent)] opacity-70',
          noisy ? 'mix-blend-screen' : 'opacity-0',
          'transition-opacity duration-motion-md ease-out',
        )}
        style={{
          maskImage: noisy
            ? 'radial-gradient(circle at 20% 20%, hsl(var(--foreground)/0.06), transparent 55%)'
            : undefined,
        }}
      />
      {ring ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[color:var(--accent-3)]/40 shadow-[var(--depth-shadow-soft)]"
        />
      ) : null}
      {grid ? (
        <div className={cn(layoutGridClassName, contentClassName)}>{children}</div>
      ) : (
        children
      )}
      {noisy ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-glitch-noise bg-[length:180px_180px] opacity-[0.05] mix-blend-soft-light motion-reduce:animate-none"
        />
      ) : null}
    </Component>
  )
}
