// src/components/error/ClientErrorBoundary.tsx
"use client";

import * as React from "react";

import { reportBoundaryError } from "@/lib/observability/boundary-error-reporter";

type BoundaryError = Error & { digest?: string };

type ClientErrorBoundaryProps = {
  readonly name: string;
  readonly children: React.ReactNode;
  readonly renderFallback?: (context: {
    error: BoundaryError;
    reset: () => void;
  }) => React.ReactNode;
};

type ClientErrorBoundaryState = {
  error: BoundaryError | null;
  resetKey: number;
};

export class ClientErrorBoundary extends React.Component<
  ClientErrorBoundaryProps,
  ClientErrorBoundaryState
> {
  state: ClientErrorBoundaryState = {
    error: null,
    resetKey: 0,
  };

  static getDerivedStateFromError(
    error: BoundaryError,
  ): Partial<ClientErrorBoundaryState> {
    return { error };
  }

  override componentDidCatch(error: BoundaryError, info: React.ErrorInfo) {
    const { name } = this.props;

    reportBoundaryError({
      boundary: name,
      error,
      info: {
        componentStack: info.componentStack,
      },
    });
  }

  private readonly handleReset = () => {
    this.setState((previous) => ({
      error: null,
      resetKey: previous.resetKey + 1,
    }));
  };

  override render() {
    const { children, renderFallback } = this.props;
    const { error, resetKey } = this.state;

    if (error) {
      if (renderFallback) {
        return renderFallback({ error, reset: this.handleReset });
      }

      return null;
    }

    return React.createElement(React.Fragment, { key: resetKey }, children);
  }
}

