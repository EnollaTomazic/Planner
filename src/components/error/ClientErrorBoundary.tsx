// src/components/error/ClientErrorBoundary.tsx
"use client";

import * as React from "react";

import { createLogger } from "@/lib/logging";
import { captureException } from "@/lib/observability/sentry";

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

const boundaryLog = createLogger("ui:error-boundary");

export default class ClientErrorBoundary extends React.Component<
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

    boundaryLog.error("Client error boundary captured an exception", {
      boundary: name,
      error,
      info,
    });

    void captureException(error, {
      tags: {
        boundary: name,
      },
      extra: {
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

