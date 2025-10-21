'use client'

import { useEffect, useState } from 'react'

interface FooterYearProps {
  buildYear: number
}

export function FooterYear({ buildYear }: FooterYearProps) {
  const [year, setYear] = useState(buildYear)

  useEffect(() => {
    const currentYear = new Date().getFullYear()

    if (currentYear !== buildYear) {
      setYear(currentYear)
    }
  }, [buildYear])

  return <span suppressHydrationWarning>{year}</span>
}
