import type { Metadata } from 'next'
import { Suspense } from 'react'
import HomePageContent from '@/app/home/HomePageContent.client'
import HomePageFallback from '@/app/home/HomePageFallback.server'
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from '@/components/ui/layout/Header'

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === 'home',
}))

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Planner · Your day at a glance',
  description:
    'Plan your day, track goals, and review games with weekly highlights that keep the team aligned.',
}

export default function Page() {
  const heroHeadingId = 'home-hero-heading'
  const overviewHeadingId = 'home-overview-heading'

  return (
    <>
      <Header
        heading='Planner'
        subtitle='Your day at a glance'
        navItems={NAV_ITEMS}
        variant='neo'
        underlineTone='brand'
        showThemeToggle
        sticky={false}
      />
      <Suspense
        fallback={
          <HomePageFallback
            heroHeadingId={heroHeadingId}
            overviewHeadingId={overviewHeadingId}
          />
        }
      >
        <HomePageContent
          heroHeadingId={heroHeadingId}
          overviewHeadingId={overviewHeadingId}
        />
      </Suspense>
    </>
  )
}
