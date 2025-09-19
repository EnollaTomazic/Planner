"use client";

import * as React from "react";
import type { SelectItem } from "@/components/ui";
import { VARIANTS, Variant } from "@/lib/theme";
import SettingsSelect from "./SettingsSelect";

export type ThemePickerProps = {
  variant: Variant;
  onVariantChange: (v: Variant) => void;
  className?: string;
};

export default function ThemePicker({ variant, onVariantChange, className = "" }: ThemePickerProps) {
  const items: SelectItem[] = React.useMemo(() => VARIANTS.map(v => ({ value: v.id, label: v.label })), []);
  return (
    <SettingsSelect
      ariaLabel="Theme"
      prefixLabel="Theme"
      items={items}
      value={variant}
      onChange={v => onVariantChange(v as Variant)}
      className={className}
    />
  );
}
