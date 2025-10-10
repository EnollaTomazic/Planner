"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { RouteErrorContent, type RouteError } from "@/app/error";
import { reportError } from "@/lib/observability/error-reporter";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: RouteError | null;
};

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: RouteError): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: RouteError, errorInfo: ErrorInfo): void {
    reportError(error, {
      boundary: "app",
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  private resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children } = this.props;

    if (error) {
      return (
        <RouteErrorContent
          error={error}
          reset={this.resetErrorBoundary}
          title="Planner hit a snag"
          description="Planner ran into a problem. You can try again or head back home while we look into it."
          retryLabel="Try again"
        />
      );
    }

    return children;
  }
}

