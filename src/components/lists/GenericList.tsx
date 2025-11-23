'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface GenericListProps<Item> {
  items: Item[]
  renderItem: (item: Item, idx: number) => React.ReactNode
  emptyState?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function GenericList<Item>({
  items,
  renderItem,
  emptyState,
  header,
  className,
}: GenericListProps<Item>) {
  return (
    <div className={cn('space-y-[var(--space-2)]', className)}>
      {header && <div className="text-label text-muted-foreground">{header}</div>}
      {items.length === 0 ? (
        emptyState ?? (
          <div className="rounded-[var(--radius-md)] border border-card-hairline bg-[hsl(var(--surface-2))] p-[var(--space-4)] text-center text-muted-foreground shadow-neo">
            Nothing here yet.
          </div>
        )
      ) : (
        <ul className="space-y-[var(--space-1)]">
          {items.map((item, idx) => (
            <li key={idx}>{renderItem(item, idx)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
