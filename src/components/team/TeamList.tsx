"use client";

import * as React from "react";

import { GenericList } from "@/components/lists/GenericList";
import type { GenericListProps } from "@/components/lists/GenericList";
import { cn } from "@/lib/utils";

export type TeamListProps<T> = GenericListProps<T>;

export function TeamList<T>({ className, ...props }: TeamListProps<T>) {
  return (
    <GenericList
      className={cn(
        "[&>ul]:m-0 [&>ul]:flex [&>ul]:flex-wrap [&>ul]:items-start [&>ul]:space-y-0",
        "[&>ul]:gap-x-[var(--space-2)] [&>ul]:gap-y-[var(--space-2)]",
        "[&>ul>li]:list-none",
        "chip-gap-x-tight chip-gap-y-tight",
        className,
      )}
      {...props}
    />
  );
}
