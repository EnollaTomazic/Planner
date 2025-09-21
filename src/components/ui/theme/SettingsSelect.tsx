"use client";

import * as React from "react";
import Select from "../Select";
import type { AnimatedSelectProps } from "../select/shared";
import { cn } from "@/lib/utils";

const SETTINGS_SELECT_BUTTON_CLASS =
  "!rounded-full !text-ui !shadow-neo-inset [--settings-select-width:var(--settings-column-width)] min-w-[var(--settings-select-width)] hover:ring-2 hover:ring-[var(--edge-iris)] focus-visible:ring-2 focus-visible:ring-[var(--edge-iris)]";

export type SettingsSelectProps = Omit<
  AnimatedSelectProps,
  "variant" | "size" | "matchTriggerWidth" | "buttonClassName"
> & {
  buttonClassName?: string;
};

export default function SettingsSelect({
  buttonClassName,
  containerClassName,
  ...props
}: SettingsSelectProps) {
  return (
    <Select
      variant="animated"
      size="sm"
      matchTriggerWidth={false}
      buttonClassName={cn(SETTINGS_SELECT_BUTTON_CLASS, buttonClassName)}
      containerClassName={cn("rounded-full", containerClassName)}
      {...props}
    />
  );
}
