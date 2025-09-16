// src/components/ui/Select.tsx
"use client";

import * as React from "react";

import AnimatedSelect from "./AnimatedSelect";
import NativeSelect from "./NativeSelect";
import type { AnimatedSelectProps, NativeSelectProps } from "./Select.types";

export type { SelectItem, AnimatedSelectProps, NativeSelectProps } from "./Select.types";

export type SelectProps =
  | (AnimatedSelectProps & { variant?: "animated" })
  | (NativeSelectProps & { variant: "native" });

type SelectRef = HTMLSelectElement | HTMLButtonElement;

const Select = React.forwardRef<SelectRef, SelectProps>(function Select(props, ref) {
  if (props.variant === "native") {
    const { variant, ...rest } = props as NativeSelectProps & { variant: "native" };
    void variant;
    return <NativeSelect ref={ref as React.Ref<HTMLSelectElement>} {...rest} />;
  }

  const { variant, ...rest } = props as AnimatedSelectProps & { variant?: "animated" };
  void variant;
  return <AnimatedSelect ref={ref as React.Ref<HTMLButtonElement>} {...rest} />;
});

Select.displayName = "Select";

export default Select;
