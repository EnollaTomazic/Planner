import type { Metadata } from 'next'
import { HomePage } from '@/components/pages'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Planner · Your day at a glance',
  description:
    'Plan your day, track goals, and review games with weekly highlights that keep the team aligned.',
}

export default function Page() {
  return <HomePage />
}
