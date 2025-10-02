"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

import { AnimatedSelectList } from "./AnimatedSelectList";
import { AnimatedSelectTrigger } from "./AnimatedSelectTrigger";
import defaultStyles from "./Select.module.css";
import type { AnimatedSelectProps } from "./shared";
import { useAnimatedSelect } from "./useAnimatedSelect";

type SelectStyles = Record<string, string>;

type AnimatedSelectComponentProps = AnimatedSelectProps & {
  styles?: SelectStyles;
};

type SelectSize = NonNullable<AnimatedSelectProps["size"]>;

const DEFAULT_TRIGGER_SIZE: SelectSize = "md";

const SIZE_STYLES: Record<
  SelectSize,
  {
    height: string;
    paddingX: string;
    caret: string;
    prefix: string;
  }
> = {
  sm: {
    height: "h-[var(--control-h-sm)]",
    paddingX: "px-[var(--space-3)]",
    caret: "size-[var(--space-4)]",
    prefix: "size-[var(--space-4)]",
  },
  md: {
    height: "h-[var(--control-h-md)]",
    paddingX: "px-[var(--space-3)]",
    caret: "size-[var(--space-5)]",
    prefix: "size-[var(--space-5)]",
  },
  lg: {
    height: "h-[var(--control-h-lg)]",
    paddingX: "px-[var(--space-4)]",
    caret: "size-[var(--space-6)]",
    prefix: "size-[var(--space-6)]",
  },
  xl: {
    height: "h-[var(--control-h-xl)]",
    paddingX: "px-[var(--space-4)]",
    caret: "size-[var(--space-6)]",
    prefix: "size-[var(--space-6)]",
  },
};

const AnimatedSelect = React.forwardRef<
  HTMLButtonElement,
  AnimatedSelectComponentProps
>(function AnimatedSelect(
  {
    id,
    label,
    prefixLabel,
    items,
    value,
    onChange,
    className = "",
    dropdownClassName = "",
    buttonClassName = "",
    containerClassName,
    placeholder = "Select…",
    disabled = false,
    hideLabel = false,
    ariaLabel,
    align = "left",
    matchTriggerWidth = true,
    size = DEFAULT_TRIGGER_SIZE,
    styles: stylesOverride,
  },
  ref,
) {
  const styles = stylesOverride ?? defaultStyles;
  const sizeStyles = SIZE_STYLES[size] ?? SIZE_STYLES[DEFAULT_TRIGGER_SIZE];
  const mounted = useMounted();

  const {
    open,
    setOpen,
    setTriggerRef,
    onTriggerKeyDown,
    onListKeyDown,
    listRef,
    current,
    lit,
    labelId,
    listboxId,
    triggerAria,
    scheduleMeasure,
    selectByIndex,
    setActiveIndex,
    placement,
    fixedStyles,
    reduceMotion,
    yOffset,
    motionDurationSm,
  } = useAnimatedSelect({
    items,
    value,
    onChange,
    matchTriggerWidth,
    align,
    size,
    label,
    prefixLabel,
    ariaLabel,
    forwardedRef: ref,
  });

  const handleToggle = React.useCallback(() => {
    scheduleMeasure();
    setOpen((prev) => !prev);
  }, [scheduleMeasure, setOpen]);

  return (
    <div id={id} className={cn("glitch-wrapper", className)}>
      {label ? (
        <div
          id={labelId}
          className={cn(
            hideLabel
              ? "sr-only"
              : "mb-[var(--space-1)] text-label text-muted-foreground",
          )}
        >
          {label}
        </div>
      ) : null}

      <AnimatedSelectTrigger
        triggerRef={setTriggerRef}
        onToggle={handleToggle}
        onKeyDown={onTriggerKeyDown}
        open={open}
        lit={lit}
        disabled={disabled}
        label={label}
        labelId={labelId}
        triggerAria={triggerAria}
        listboxId={listboxId}
        styles={styles}
        sizeStyles={sizeStyles}
        buttonClassName={buttonClassName}
        containerClassName={containerClassName}
        current={current}
        placeholder={placeholder}
        prefixLabel={prefixLabel}
      />

      {mounted &&
        createPortal(
          <AnimatedSelectList
            open={open}
            items={items}
            value={value}
            setActiveIndex={setActiveIndex}
            selectByIndex={selectByIndex}
            onKeyDown={onListKeyDown}
            listRef={listRef}
            styles={styles}
            dropdownClassName={dropdownClassName}
            triggerAria={triggerAria}
            label={label}
            labelId={labelId}
            listboxId={listboxId}
            fixedStyles={fixedStyles}
            placement={placement}
            reduceMotion={reduceMotion}
            motionDurationSm={motionDurationSm}
            yOffset={yOffset}
          />, 
          document.body
        )}
    </div>
  );
});

AnimatedSelect.displayName = "AnimatedSelect";

export default AnimatedSelect;
