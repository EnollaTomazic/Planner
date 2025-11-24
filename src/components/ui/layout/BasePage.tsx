import { Header } from '@/components/ui/layout/Header'
import { Hero } from '@/components/ui/layout/Hero'
import { PageShell } from '@/components/ui/layout/PageShell'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Props for building a page layout with a unified header, hero and main.
 */
export interface BasePageProps {
  headerProps: {
    heading: ReactNode
    subtitle?: string
    icon?: ReactNode
    tabs?: Parameters<typeof Header>[0]['tabs']
    search?: ReactNode
    actions?: ReactNode
  }
  hero?: {
    eyebrow?: string
    title: string | ReactNode
    subtitle?: string
    glitch?: ComponentProps<typeof Hero>['glitch']
    illustration?: ReactNode
    illustrationAlt?: string
    actions?: ReactNode
    children?: ReactNode
  }
  children: ReactNode
}

export function BasePage({ headerProps, hero, children }: BasePageProps) {
  return (
    <>
      <Header
        heading={headerProps.heading}
        subtitle={headerProps.subtitle}
        icon={headerProps.icon}
        variant="neo"
        underlineTone="brand"
        tabs={headerProps.tabs}
        search={headerProps.search}
        actions={headerProps.actions}
      />
      {hero && (
        <PageShell as="header" grid className="py-[var(--space-7)]">
          <Hero
            eyebrow={hero.eyebrow}
            title={hero.title}
            subtitle={hero.subtitle}
            glitch={hero.glitch ?? 'subtle'}
            illustration={hero.illustration}
            illustrationAlt={hero.illustrationAlt}
            actions={hero.actions}
            frame
          >
            {hero.children}
          </Hero>
        </PageShell>
      )}
      <PageShell as="main" id="page-main" tabIndex={-1} className="py-[var(--space-6)]">
        {children}
      </PageShell>
    </>
  )
}
