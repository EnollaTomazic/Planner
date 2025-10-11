"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { isNavActive } from "@/config/nav"
import { withoutBasePath } from "@/lib/utils"

export function useNavActivity() {
  const rawPathname = usePathname() ?? "/"
  const pathname = React.useMemo(() => withoutBasePath(rawPathname), [rawPathname])

  const isActive = React.useCallback(
    (href: string) => isNavActive(pathname, href),
    [pathname],
  )

  return { pathname, isActive }
}
