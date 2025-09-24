"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import styles from "./GlitchSegmented.module.css";

export interface GlitchSegmentedGroupProps {
  value: string;
  onChange?: (v: string) => void;
  ariaLabel?: string;
  ariaLabelledby?: string;
  children: React.ReactNode;
  className?: string;
}

export interface GlitchSegmentedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  value: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
}

export const GlitchSegmentedGroup = ({
  value,
  onChange = () => {},
  ariaLabel,
  ariaLabelledby,
  children,
  className,
}: GlitchSegmentedGroupProps) => {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = (index: number) => (el: HTMLButtonElement | null) => {
    btnRefs.current[index] = el;
  };

  const childArray = React.Children.toArray(children);
  const buttonChildren = childArray.filter(
    (child): child is React.ReactElement<GlitchSegmentedButtonProps> =>
      React.isValidElement<GlitchSegmentedButtonProps>(child) &&
      child.type === GlitchSegmentedButton,
  );
  const values = buttonChildren.map((child) => child.props.value);
  btnRefs.current.length = buttonChildren.length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = values.findIndex((v) => v === value);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      const next = (idx + 1) % values.length;
      onChange(values[next]);
      btnRefs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      const prev = (idx - 1 + values.length) % values.length;
      onChange(values[prev]);
      btnRefs.current[prev]?.focus();
      e.preventDefault();
    } else if (e.key === "Home") {
      onChange(values[0]);
      btnRefs.current[0]?.focus();
      e.preventDefault();
    } else if (e.key === "End") {
      const last = values.length - 1;
      onChange(values[last]);
      btnRefs.current[last]?.focus();
      e.preventDefault();
    }
  };

  let buttonIndex = 0;

  return (
    <div
      role="tablist"
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        "inline-flex rounded-[var(--control-radius)] bg-[var(--btn-bg)] p-[var(--space-1)] gap-[var(--space-1)]",
        "[--hover:hsl(var(--foreground)/0.08)] [--focus:hsl(var(--ring))] [--active:hsl(var(--foreground)/0.12)] [--disabled:0.5]",
        className,
      )}
      onKeyDown={onKeyDown}
    >
      {React.Children.map(children, (child) => {
        if (
          !(
            React.isValidElement<GlitchSegmentedButtonProps>(child) &&
            child.type === GlitchSegmentedButton
          )
        ) {
          return child;
        }
        const currentIndex = buttonIndex++;
        const selected = child.props.value === value;
        const normalizedValue = normalizeValueForId(child.props.value);

        return React.cloneElement(child, {
          ref: setBtnRef(currentIndex),
          tabIndex: selected ? 0 : -1,
          selected,
          onSelect: () => onChange(child.props.value),
          id: child.props.id ?? `${normalizedValue}-tab`,
          "aria-controls":
            child.props["aria-controls"] ?? `${normalizedValue}-panel`,
        } as Partial<GlitchSegmentedButtonProps> &
          React.RefAttributes<HTMLButtonElement>);
      })}
    </div>
  );
};

export const GlitchSegmentedButton = React.forwardRef<
  HTMLButtonElement,
  GlitchSegmentedButtonProps
>(({ icon, children, className, selected, onSelect, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      data-selected={selected ? "true" : undefined}
      onClick={onSelect}
      className={cn(
        styles.glitchScanlines,
        "flex-1 h-[var(--control-h-sm)] px-[var(--space-3)] inline-flex items-center justify-center gap-[var(--space-2)] text-ui font-medium select-none",
        "rounded-[var(--control-radius)] transition focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[var(--focus)]",
        "bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[--hover] active:bg-[--active]",
        "motion-safe:hover:-translate-y-[var(--spacing-0-25)] motion-safe:hover:shadow-neon-soft",
        "motion-safe:active:shadow-neon-soft motion-safe:active:scale-95 motion-reduce:transform-none",
        "data-[selected=true]:shadow-neon-strong data-[selected=true]:ring-1 data-[selected=true]:ring-[var(--neon-soft)]",
        "disabled:opacity-disabled disabled:pointer-events-none",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex h-[var(--space-4)] w-[var(--space-4)] items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
});

GlitchSegmentedButton.displayName = "GlitchSegmentedButton";

const normalizeValueForId = (value: string): string => {
  const slug = slugify(value);
  if (slug) return slug;

  const hexFallback = Array.from(value).reduce((acc, char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) return acc;
    return acc + codePoint.toString(16).padStart(2, "0");
  }, "");

  return hexFallback || "segment";
};
