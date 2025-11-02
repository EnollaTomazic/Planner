"use client";

import * as React from "react";

import { GenericList } from "@/components/lists/GenericList";
import type { GenericListProps } from "@/components/lists/GenericList";
import { cn } from "@/lib/utils";

const TEAM_LIST_CLASSNAME =
  "flex flex-wrap items-start gap-x-[var(--space-2)] gap-y-[var(--space-2)] chip-gap-x-tight chip-gap-y-tight";

export type TeamListProps<T> = GenericListProps<T>;

export function TeamList<T>({ listClassName, ...props }: TeamListProps<T>) {
  return (
    <GenericList
      listClassName={cn(TEAM_LIST_CLASSNAME, listClassName)}
      {...props}
    />
  );
}
