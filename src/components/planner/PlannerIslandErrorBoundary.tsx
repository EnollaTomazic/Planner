// src/components/planner/PlannerIslandErrorBoundary.tsx
"use client"

import * as React from "react"
import { Button, PageShell, SectionCard } from "@/components/ui"
import { createLogger } from "@/lib/logging"
import { captureException } from "@/lib/observability/sentry"
import { reportPlannerIslandError } from "@/lib/observability/telemetry"

const plannerIslandBoundaryLog = createLogger("planner:island-boundary")

type PlannerIslandErrorBoundaryProps = {
  islandId: string
  islandLabel: string
  children: React.ReactNode
}

type PlannerIslandErrorBoundaryImplProps = PlannerIslandErrorBoundaryProps & {
  onRetry: () => void
}

type PlannerIslandErrorBoundaryState = {
  hasError: boolean
}

class PlannerIslandErrorBoundaryImpl extends React.Component<
  PlannerIslandErrorBoundaryImplProps,
  PlannerIslandErrorBoundaryState
> {
  state: PlannerIslandErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): PlannerIslandErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error & { digest?: string }) {
    const { islandId, islandLabel } = this.props

    plannerIslandBoundaryLog.error(
      "Planner island failed to render",
      {
        islandId,
        islandLabel,
        name: error.name,
        message: error.message,
      },
    )

    reportPlannerIslandError({
      islandId,
      islandLabel,
      errorName: error.name,
      errorMessage: error.message,
      errorDigest: error.digest,
    })

    void captureException(error, {
      tags: {
        boundary: "planner-island",
        islandId,
      },
      extra: {
        islandLabel,
      },
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
    this.props.onRetry()
  }

  render() {
    if (this.state.hasError) {
      return (
        <PlannerIslandFallback
          islandLabel={this.props.islandLabel}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

type PlannerIslandFallbackProps = {
  islandLabel: string
  onRetry: () => void
}

function PlannerIslandFallback({ islandLabel, onRetry }: PlannerIslandFallbackProps) {
  const headingId = React.useId()

  return (
    <PageShell
      as="section"
      grid
      role="alert"
      aria-labelledby={headingId}
      className="py-[var(--space-6)]"
    >
      <SectionCard className="col-span-full" aria-labelledby={headingId}>
        <SectionCard.Header
          id={headingId}
          sticky={false}
          title={`${islandLabel} is unavailable`}
          titleClassName="text-title font-semibold tracking-[-0.01em]"
        />
        <SectionCard.Body className="flex flex-col gap-[var(--space-3)]">
          <p className="text-body text-muted-foreground">
            Something went wrong while loading the {islandLabel}. You can try again to reload
            this section without refreshing the entire page.
          </p>
          <div>
            <Button variant="default" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </SectionCard.Body>
      </SectionCard>
    </PageShell>
  )
}

export default function PlannerIslandErrorBoundary(
  props: PlannerIslandErrorBoundaryProps,
) {
  const [attempt, setAttempt] = React.useState(0)

  const handleRetry = React.useCallback(() => {
    setAttempt((value) => value + 1)
  }, [])

  return (
    <PlannerIslandErrorBoundaryImpl
      key={attempt}
      {...props}
      onRetry={handleRetry}
    />
  )
}
