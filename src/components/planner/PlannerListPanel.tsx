"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PlannerListPanelProps = {
  renderComposer?: () => React.ReactNode;
  renderEmpty: () => React.ReactNode;
  renderList: () => React.ReactNode;
  isEmpty: boolean;
  className?: string;
  viewportClassName?: string;
  viewportInsetClassName?: string;
  viewportStyle?: React.CSSProperties;
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
  viewportStyle,
  viewportProps,
}: PlannerListPanelProps) {
  const {
    className: viewportPropsClassName,
    style: viewportPropsStyle,
    ...restViewportProps
  } = viewportProps ?? {};

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
          "w-full overflow-y-auto",
          viewportInsetClassName,
          viewportPropsClassName,
          viewportClassName,
        )}
        style={{ ...viewportPropsStyle, ...viewportStyle }}
      >
        {content}
      </div>
    </div>
  );
}
