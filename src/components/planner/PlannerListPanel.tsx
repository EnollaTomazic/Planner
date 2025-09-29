"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import "./PlannerListPanel.css";

type PlannerViewportSizeToken = "minHTasks" | "maxHTasks" | "maxHProjects";

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
  viewportProps?: React.HTMLAttributes<HTMLDivElement>;
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
  const {
    className: viewportPropsClassName,
    style: viewportPropsStyle,
    ...restViewportProps
  } = viewportProps ?? {};

  const viewportSizeValue = Array.isArray(viewportSize)
    ? viewportSize.join(" ")
    : viewportSize;

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
        data-viewport-size={viewportSizeValue}
        className={cn(
          "planner-viewport w-full overflow-y-auto",
          viewportInsetClassName,
          viewportPropsClassName,
          viewportClassName,
        )}
        style={viewportPropsStyle}
      >
        {content}
      </div>
    </div>
  );
}
