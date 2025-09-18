import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./RecessedSurface.module.css";

export type RecessedPanelProps = React.HTMLAttributes<HTMLDivElement>;

const RecessedPanel = React.forwardRef<HTMLDivElement, RecessedPanelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(styles.panel, className)}
      {...props}
    />
  ),
);

RecessedPanel.displayName = "RecessedPanel";

export default RecessedPanel;
