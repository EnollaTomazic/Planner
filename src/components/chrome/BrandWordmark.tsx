"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./BrandWordmark.module.css";

type BrandWordmarkProps = React.ComponentPropsWithoutRef<"span">;

export function BrandWordmark({
  className,
  children = "noxi",
  ...props
}: BrandWordmarkProps) {
  return (
    <span
      {...props}
      className={cn(
        styles.root,
        "relative inline-flex items-center font-semibold leading-none text-ui md:text-title",
        "tracking-[0.08em] text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
