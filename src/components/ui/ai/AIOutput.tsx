'use client'

import * as React from 'react'
import { Edit3, RefreshCcw, X } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/primitives/Button'
import { IconButton } from '@/components/ui/primitives/IconButton'
import { cn } from '@/lib/utils'

export type AIOutputAction = {
  label: string
  onSelect?: () => void
  icon?: React.ReactNode
  'aria-label'?: string
}

export interface AIOutputProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  confidence?: number | null
  actions?: AIOutputAction[]
  onEdit?: () => void
  onRetry?: () => void
  onDismiss?: () => void
  children: React.ReactNode
  tone?: 'default' | 'info' | 'success' | 'danger'
}

export function AIOutput({
  title = 'AI suggestion',
  confidence,
  actions,
  onEdit,
  onRetry,
  onDismiss,
  children,
  className,
  tone = 'info',
  ...rest
}: AIOutputProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const confidenceLabel =
    typeof confidence === 'number'
      ? `${confidence.toFixed(0)}% confidence`
      : 'Confidence unknown'

  const actionList = actions?.filter(Boolean) ?? []

  if (dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <Card
      role="status"
      aria-live="polite"
      status={tone === 'danger' ? 'error' : tone === 'success' ? 'success' : 'info'}
      className={cn('relative overflow-hidden bg-card/70', className)}
      {...rest}
    >
      <CardHeader className="flex flex-col gap-[var(--space-2)]">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="flex items-center gap-[var(--space-2)] text-muted-foreground">
              <span aria-live="polite">{confidenceLabel}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--space-2)]" role="group" aria-label="Suggestion controls">
            {onEdit ? (
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Edit suggestion"
                onClick={onEdit}
              >
                <Edit3 className="size-[var(--space-3)]" />
              </IconButton>
            ) : null}
            {onRetry ? (
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Retry suggestion"
                onClick={onRetry}
              >
                <RefreshCcw className="size-[var(--space-3)]" />
              </IconButton>
            ) : null}
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Dismiss suggestion"
              onClick={handleDismiss}
            >
              <X className="size-[var(--space-3)]" />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--space-3)]" aria-live="polite">
        {typeof children === 'string' ? <p className="text-body leading-relaxed">{children}</p> : children}
      </CardContent>
      {actionList.length > 0 ? (
        <CardFooter className="flex flex-wrap gap-[var(--space-2)]">
          {actionList.map((action, index) => (
            <Button
              key={`${action.label}-${index}`}
              variant="secondary"
              size="sm"
              onClick={action.onSelect}
              aria-label={action['aria-label'] ?? (typeof action.label === 'string' ? action.label : undefined)}
              className="group"
            >
              {action.icon ? <span className="mr-[var(--space-1)] inline-flex items-center">{action.icon}</span> : null}
              {action.label}
            </Button>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  )
}
