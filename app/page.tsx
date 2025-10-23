import type { Metadata } from 'next'
import { Suspense } from 'react'
import HomePageContent from '@/app/home/HomePageContent.client'
import HomePageFallback from '@/app/home/HomePageFallback.client'

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
  )
}
