import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { UseAnimatedSelectReturn } from "./useAnimatedSelect";

type SelectStyles = Record<string, string>;

type SizeStyles = {
  height: string;
  paddingX: string;
  caret: string;
  prefix: string;
};

type AnimatedSelectTriggerProps = {
  triggerRef: (node: HTMLButtonElement | null) => void;
  onToggle: () => void;
  onKeyDown: UseAnimatedSelectReturn["onTriggerKeyDown"];
  open: boolean;
  lit: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  labelId: string;
  triggerAria?: string;
  listboxId: string;
  styles: SelectStyles;
  sizeStyles: SizeStyles;
  buttonClassName?: string;
  containerClassName?: string;
  current: UseAnimatedSelectReturn["current"];
  placeholder: string;
  prefixLabel?: React.ReactNode;
};

export function AnimatedSelectTrigger({
  triggerRef,
  onToggle,
  onKeyDown,
  open,
  lit,
  disabled,
  label,
  labelId,
  triggerAria,
  listboxId,
  styles,
  sizeStyles,
  buttonClassName,
  containerClassName,
  current,
  placeholder,
  prefixLabel,
}: AnimatedSelectTriggerProps) {
  const triggerCls = cn(
    styles.glitchTrigger,
    "relative flex items-center rounded-[var(--control-radius)] overflow-hidden",
    sizeStyles.height,
    sizeStyles.paddingX,
    "bg-surface-muted hover:bg-surface-hover",
    "transition-colors transition-shadow duration-motion-sm ease-out motion-reduce:transition-none",
    "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    buttonClassName,
  );

  const containerCls = cn(
    "group inline-flex rounded-[var(--control-radius)] border border-border-subtle shadow-neo-soft transition-shadow duration-motion-sm ease-out motion-reduce:transition-none",
    "hover:shadow-neo focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-surface focus-within:shadow-neo",
    containerClassName,
  );

  const caretCls = cn(
    styles.caret,
    "ml-auto shrink-0 opacity-75",
    sizeStyles.caret,
    open && styles.caretOpen,
  );

  const textCls = cn(
    "font-medium transition-colors duration-motion-sm ease-out motion-reduce:transition-none",
    styles.glitchText,
    current
      ? [lit ? "text-foreground" : "text-muted-foreground", "group-hover:text-foreground"]
      : ["text-muted-foreground", "group-hover:text-muted-foreground"],
  );

  return (
    <div className={containerCls}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : triggerAria}
        className={triggerCls}
        data-lit={lit ? "true" : "false"}
        data-open={open ? "true" : "false"}
      >
        {prefixLabel ? (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "shrink-0 text-muted-foreground opacity-80 transition-colors duration-motion-sm ease-out motion-reduce:transition-none",
              sizeStyles.prefix,
            )}
          />
        ) : null}

        <span className={textCls}>{current ? current.label : placeholder}</span>

        <ChevronDown className={caretCls} aria-hidden="true" />

        <span aria-hidden className={styles.gbIris} />
        <span aria-hidden className={styles.gbChroma} />
        <span aria-hidden className={styles.gbFlicker} />
        <span aria-hidden className={styles.gbScan} />
      </button>
    </div>
  );
}
