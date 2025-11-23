'use client'

import * as React from 'react'

import { Badge, Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/lib/utils'

export interface DayAccordionItem {
  readonly id: string
  readonly title: React.ReactNode
  readonly summary?: React.ReactNode
  readonly meta?: React.ReactNode
  readonly defaultOpen?: boolean
  readonly children?: React.ReactNode
}

export interface DayAccordionProps {
  readonly items: readonly DayAccordionItem[]
  readonly className?: string
  readonly onToggle?: (itemId: string, expanded: boolean) => void
}

export function DayAccordion({ items, className, onToggle }: DayAccordionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-[var(--space-3)]', className)}>
      {items.map((item, index) => {
        const controlId = `day-accordion-${item.id}`
        return (
          <Card key={item.id} className="overflow-hidden">
            <details
              id={controlId}
              className="group"
              open={item.defaultOpen ?? index === 0}
              onToggle={(event) =>
                onToggle?.(item.id, (event.target as HTMLDetailsElement).open)
              }
            >
              <summary
                className={cn(
                  "flex cursor-pointer items-start gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] text-left",
                  "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "group-open:border-b group-open:border-card-hairline-60",
                )}
              >
                <div className="flex-1 space-y-[var(--space-1)]">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <span className="text-base font-semibold leading-none tracking-[-0.01em]">
                      {item.title}
                    </span>
                    {item.meta ? (
                      <Badge tone="support" size="sm" className="text-muted-foreground">
                        {item.meta}
                      </Badge>
                    ) : null}
                  </div>
                  {item.summary ? (
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground"
                  aria-controls={controlId}
                  aria-expanded={undefined}
                  data-state={item.defaultOpen ? "open" : "closed"}
                >
                  <span className="group-open:hidden">Expand</span>
                  <span className="hidden group-open:inline">Collapse</span>
                </Button>
              </summary>
              <CardContent className="space-y-[var(--space-2)] text-base text-muted-foreground">
                {item.children}
              </CardContent>
            </details>
          </Card>
        )
      })}
    </div>
  )
}
