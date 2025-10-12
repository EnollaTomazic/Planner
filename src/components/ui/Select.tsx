"use client";

import * as React from "react";

import { AnimatedSelect } from "./select/AnimatedSelect";
import { NativeSelect } from "./select/NativeSelect";
import selectStyles from "./select/Select.module.css";
import type {
  AnimatedSelectProps,
  NativeSelectProps,
  SelectProps,
  SelectRef,
} from "./select/shared";
import { isNativeSelect } from "./select/shared";

const Select = React.forwardRef<SelectRef, SelectProps>(function Select(
  props,
  ref,
) {
  if (isNativeSelect(props)) {
    const { variant, ...rest } = props as NativeSelectProps & {
      variant: "native";
    };
    void variant;
    return (
      <NativeSelect
        ref={ref as React.Ref<HTMLSelectElement>}
        {...rest}
      />
    );
  }
  const { variant, ...rest } = props as AnimatedSelectProps & {
    variant?: "animated";
  };
  void variant;
  return (
    <AnimatedSelect
      ref={ref as React.Ref<HTMLButtonElement>}
      styles={selectStyles}
      {...rest}
    />
  );
});

Select.displayName = "Select";
export { AnimatedSelect, NativeSelect };
export * from "./select/shared";
export { Select };
