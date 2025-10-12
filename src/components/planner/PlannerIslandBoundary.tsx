// src/components/planner/PlannerIslandBoundary.tsx
"use client";

import * as React from "react";

import { ClientErrorBoundary } from "@/components/error/ClientErrorBoundary";
import { Button, SectionCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { reportPlannerIslandError } from "@/lib/telemetry";

type BoundaryError = Error & { digest?: string };

type PlannerIslandBoundaryProps = {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly retryLabel?: string;
  readonly variant?: "card" | "plain";
  readonly fallbackClassName?: string;
  readonly children: React.ReactNode;
};

type PlannerIslandFallbackProps = {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly retryLabel: string;
  readonly variant: "card" | "plain";
  readonly className?: string;
  readonly error: BoundaryError;
  readonly onRetry: () => void;
};

function PlannerIslandFallback({
  name,
  title,
  description,
  retryLabel,
  variant,
  className,
  error,
  onRetry,
}: PlannerIslandFallbackProps) {
  React.useEffect(() => {
    reportPlannerIslandError({
      island: name,
      digest: error.digest ?? null,
      message: error.message ?? null,
    });
  }, [error.digest, error.message, name]);

  if (variant === "plain") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          "rounded-card border border-border/40 bg-card/80 p-[var(--space-4)] shadow-xs",
          "space-y-[var(--space-2)]",
          className,
        )}
      >
        <p className="text-label font-semibold text-foreground">{title}</p>
        <p className="text-body text-muted-foreground">{description}</p>
        <div>
          <Button size="sm" variant="default" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SectionCard role="alert" aria-live="assertive" className={className}>
      <SectionCard.Body className="space-y-[var(--space-2)]">
        <p className="text-label font-semibold text-foreground">{title}</p>
        <p className="text-body text-muted-foreground">{description}</p>
        <div>
          <Button size="sm" variant="default" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}

export function PlannerIslandBoundary({
  name,
  title,
  description,
  retryLabel = "Retry",
  variant = "card",
  fallbackClassName,
  children,
}: PlannerIslandBoundaryProps) {
  return (
    <ClientErrorBoundary
      name={name}
      renderFallback={({ error, reset }) => (
        <PlannerIslandFallback
          name={name}
          title={title}
          description={description}
          retryLabel={retryLabel}
          variant={variant}
          className={fallbackClassName}
          error={error}
          onRetry={reset}
        />
      )}
    >
      {children}
    </ClientErrorBoundary>
  );
}

