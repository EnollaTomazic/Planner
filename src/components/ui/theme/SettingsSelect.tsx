"use client";

import * as React from "react";
import Select from "../Select";
import type { AnimatedSelectProps } from "../select/shared";
import { cn } from "@/lib/utils";

const SETTINGS_SELECT_BUTTON_CLASS = "chip-trigger";
const SETTINGS_SELECT_CONTAINER_CLASS = "chip-trigger-container";

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
      containerClassName={cn(SETTINGS_SELECT_CONTAINER_CLASS, containerClassName)}
      {...props}
    />
  );
}
