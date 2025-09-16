import * as React from "react";

export type SelectItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onSelect?: () => void;
};

export type AnimatedSelectProps = {
  id?: string;
  label?: React.ReactNode;
  prefixLabel?: React.ReactNode;
  items: SelectItem[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
  align?: "left" | "right";
  matchTriggerWidth?: boolean;
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
  /** Optional className for the inner <select> element */
  selectClassName?: string;
}
