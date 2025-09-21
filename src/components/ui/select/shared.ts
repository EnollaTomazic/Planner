import * as React from "react";

import type { InputSize } from "../primitives/Input";

export type SelectItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onSelect?: () => void;
};

type Align = "left" | "right";

type CommonSelectProps = {
  id?: string;
  label?: React.ReactNode;
  prefixLabel?: React.ReactNode;
  items: SelectItem[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};

export type AnimatedSelectProps = CommonSelectProps & {
  dropdownClassName?: string;
  buttonClassName?: string;
  containerClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
  align?: Align;
  matchTriggerWidth?: boolean;
  size?: InputSize;
};

export interface NativeSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "children" | "value" | "onChange"
  > {
  items: SelectItem[];
  value?: string;
  onChange?: (v: string) => void;
  helperText?: string;
  errorText?: string;
  success?: boolean;
  selectClassName?: string;
}

export type SelectProps =
  | (AnimatedSelectProps & { variant?: "animated" })
  | (NativeSelectProps & { variant: "native" });

export type SelectRef = HTMLSelectElement | HTMLButtonElement;

export function isNativeSelect(props: SelectProps): props is NativeSelectProps & {
  variant: "native";
} {
  return props.variant === "native";
}
