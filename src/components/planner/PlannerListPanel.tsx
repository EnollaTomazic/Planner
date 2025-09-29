"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import "./PlannerListPanel.css";

type PlannerViewportSizeToken = "minHTasks" | "maxHTasks" | "maxHProjects";

const VIEWPORT_SIZE_CLASS_NAMES: Record<PlannerViewportSizeToken, string> = {
  minHTasks: "planner-viewport--minHTasks",
  maxHTasks: "planner-viewport--maxHTasks",
  maxHProjects: "planner-viewport--maxHProjects",
};

type PlannerListPanelProps = {
  renderComposer?: () => React.ReactNode;
  renderEmpty: () => React.ReactNode;
  renderList: () => React.ReactNode;
  isEmpty: boolean;
  className?: string;
  viewportClassName?: string;
  viewportInsetClassName?: string;
  /**
   * Applies predefined viewport sizing tokens. Tokens map to utilities defined
   * in PlannerListPanel.css: `minHTasks` enforces the task list minimum height,
   * `maxHTasks` caps the task viewport, and `maxHProjects` aligns the project
   * list with its design-system max height.
   */
  viewportSize?:
    | PlannerViewportSizeToken
    | PlannerViewportSizeToken[];
  viewportProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "style">;
};

export default function PlannerListPanel({
  renderComposer,
  renderEmpty,
  renderList,
  isEmpty,
  className,
  viewportClassName,
  viewportInsetClassName = "card-pad",
  viewportSize,
  viewportProps,
}: PlannerListPanelProps) {
  const { className: viewportPropsClassName, ...restViewportProps } = viewportProps ?? {};

  const viewportSizeTokens = Array.isArray(viewportSize)
    ? viewportSize
    : viewportSize
      ? [viewportSize]
      : [];

  const viewportSizeClasses = viewportSizeTokens.map(
    (token) => VIEWPORT_SIZE_CLASS_NAMES[token],
  );

  const composer = renderComposer?.();
  const content = isEmpty ? renderEmpty() : renderList();

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-[var(--space-3)]",
        className,
      )}
    >
      {composer}
      <div
        {...restViewportProps}
        className={cn(
          "planner-viewport w-full overflow-y-auto",
          viewportInsetClassName,
          viewportPropsClassName,
          viewportClassName,
          viewportSizeClasses,
        )}
      >
        {content}
      </div>
    </div>
  );
}
