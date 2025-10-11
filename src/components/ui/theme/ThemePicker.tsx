"use client";

import * as React from "react";
import type { SelectItem } from "@/components/ui";
import { VARIANTS, Variant } from "@/lib/theme";
import { SettingsSelect } from "./SettingsSelect";

export type ThemePickerProps = {
  variant: Variant;
  onVariantChange: (v: Variant) => void;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  loadingVariant?: Variant | null;
};

export function ThemePicker({
  variant,
  onVariantChange,
  className = "",
  buttonClassName,
  disabled = false,
  loadingVariant = null,
}: ThemePickerProps) {
  const items: SelectItem[] = React.useMemo(
    () =>
      VARIANTS.map((v) => ({
        value: v.id,
        label: v.label,
        loading: loadingVariant === v.id,
      })),
    [loadingVariant],
  );
  return (
    <SettingsSelect
      ariaLabel="Theme"
      prefixLabel="Theme"
      items={items}
      value={variant}
      onChange={(v) => onVariantChange(v as Variant)}
      className={className}
      buttonClassName={buttonClassName}
      disabled={disabled}
    />
  );
}
