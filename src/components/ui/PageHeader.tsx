import * as React from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  accent?: 'glitch' | 'aurora' | 'kitten' | 'oceanic' | 'citrus' | 'noir' | 'hardstuck'
  children?: React.ReactNode
}

// TODO: Replace hard-coded accent choices with Planner theme tokens once surfaced by the design system registry.
const accentColorMap: Record<NonNullable<PageHeaderProps['accent']>, string> = {
  glitch: 'hsl(var(--accent-1))',
  aurora:
    'color-mix(in oklab, hsl(var(--accent-2)) 78%, hsl(var(--accent-3, var(--accent-13))) 22%)',
  kitten: 'color-mix(in oklab, hsl(var(--accent-1)) 48%, hsl(var(--lav-deep)) 52%)',
  oceanic:
    'color-mix(in oklab, hsl(var(--accent-2)) 60%, hsl(var(--accent-3, var(--accent-13))) 40%)',
  citrus: 'hsl(var(--warning))',
  noir: 'color-mix(in oklab, hsl(var(--foreground)) 68%, hsl(var(--surface-2)) 32%)',
  hardstuck: 'color-mix(in oklab, hsl(var(--accent-1)) 55%, hsl(var(--warning)) 45%)',
}

const fallbackAccent = accentColorMap.aurora

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  accent = 'aurora',
  children,
}) => {
  const idBase = React.useId()
  const headingId = `${idBase}-heading`
  const subtitleId = subtitle ? `${idBase}-subtitle` : undefined
  const accentColor = accentColorMap[accent] ?? fallbackAccent

  const accentVariables: React.CSSProperties = {
    '--page-header-accent': accentColor,
    '--page-header-subtle-text': 'color-mix(in oklab, hsl(var(--foreground)) 72%, hsl(var(--surface-2)) 28%)',
    '--page-header-aura': 'color-mix(in oklab, var(--page-header-accent) 35%, transparent)',
    '--page-header-aura-soft': 'color-mix(in oklab, var(--page-header-accent) 22%, transparent)',
    '--page-header-aura-dim': 'color-mix(in oklab, var(--page-header-accent) 18%, transparent)',
    '--page-header-ring': 'color-mix(in oklab, var(--page-header-accent) 45%, transparent)',
    '--page-header-shadow': 'color-mix(in oklab, var(--page-header-accent) 58%, transparent)',
  } as React.CSSProperties

  const auraStyle: React.CSSProperties = {
    background:
      'radial-gradient(circle at 15% 20%, var(--page-header-aura) 0%, transparent 60%), radial-gradient(circle at 82% 28%, var(--page-header-aura-soft) 0%, transparent 62%), radial-gradient(circle at 50% 82%, var(--page-header-aura-dim) 0%, transparent 68%)',
  }

  const noiseStyle: React.CSSProperties = {
    backgroundImage:
      'repeating-radial-gradient(circle at center, hsl(var(--foreground) / 0.12) 0, hsl(var(--foreground) / 0.12) var(--hairline-w), transparent var(--hairline-w), transparent calc(var(--hairline-w) * 3))',
    backgroundSize: 'calc(var(--spacing-8) * 2) calc(var(--spacing-8) * 2)',
  }

  const titleShadow = [
    '0 0 var(--spacing-6) var(--page-header-shadow)',
    '0 0 var(--spacing-7) color-mix(in oklab, var(--page-header-accent) 55%, transparent)',
  ].join(', ')

  return (
    <section
      aria-labelledby={headingId}
      aria-describedby={subtitleId}
      className='relative overflow-hidden rounded-3xl border border-[color:hsl(var(--border)/0.35)] bg-[color:color-mix(in_oklab,hsl(var(--surface))_82%,hsl(var(--background))_18%)] px-6 py-10 text-left text-[hsl(var(--foreground))] [box-shadow:var(--depth-shadow-outer-strong)] sm:px-10 sm:py-12'
      style={accentVariables}
    >
      <div className='pointer-events-none absolute inset-0 opacity-90 blur-2xl' style={auraStyle} />
      <div className='pointer-events-none absolute inset-0 opacity-[0.08]' style={noiseStyle} />
      <div className='relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1 space-y-3'>
          <div className='relative inline-flex'>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 -translate-y-1/4 rounded-full opacity-70 blur-3xl'
              style={{
                background: 'radial-gradient(circle, var(--page-header-ring) 0%, transparent 65%)',
              }}
            />
            <h1
              id={headingId}
              className='relative text-balance text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] drop-shadow-[0_0_35px_hsl(var(--foreground)/0.35)] sm:text-4xl'
              style={{
                textShadow: titleShadow,
              }}
            >
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p
              id={subtitleId}
              className='max-w-2xl text-base text-[color:var(--page-header-subtle-text)] sm:text-lg'
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className='flex flex-shrink-0 items-center gap-3 text-sm text-[hsl(var(--foreground))] sm:gap-4'>{children}</div>
        ) : null}
      </div>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -bottom-28 left-1/2 h-40 w-[120%] -translate-x-1/2 rounded-full opacity-40 blur-3xl'
        style={{
          background: 'radial-gradient(circle, var(--page-header-aura-soft) 0%, transparent 70%)',
        }}
      />
    </section>
  )
}

PageHeader.displayName = 'PageHeader'

