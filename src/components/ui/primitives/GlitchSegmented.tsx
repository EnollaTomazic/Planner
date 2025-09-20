"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import { buttonSizes, type ButtonSize } from "./Button";
import styles from "./GlitchSegmented.module.css";

export interface GlitchSegmentedGroupProps {
  value: string;
  onChange?: (v: string) => void;
  ariaLabel?: string;
  ariaLabelledby?: string;
  children: React.ReactNode;
  className?: string;
  size?: ButtonSize;
}

export interface GlitchSegmentedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  value: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  size?: ButtonSize;
}

type GlitchSegmentedSizeStyles = {
  height: string;
  paddingX: string;
  gap: string;
  text: string;
  icon: string;
  iconWrap: string;
};

const GLITCH_SEGMENTED_SIZE_STYLES: Record<ButtonSize, GlitchSegmentedSizeStyles> = {
  sm: {
    height: buttonSizes.sm.height,
    paddingX: "px-[var(--space-3)]",
    gap: "gap-[var(--space-2)]",
    text: "text-ui",
    icon: "[&_svg]:size-[var(--space-4)]",
    iconWrap: "size-[var(--space-4)]",
  },
  md: {
    height: buttonSizes.md.height,
    paddingX: "px-[var(--space-4)]",
    gap: "gap-[var(--space-3)]",
    text: "text-ui",
    icon: "[&_svg]:size-[var(--space-5)]",
    iconWrap: "size-[var(--space-5)]",
  },
  lg: {
    height: buttonSizes.lg.height,
    paddingX: "px-[var(--space-5)]",
    gap: "gap-[var(--space-3)]",
    text: "text-title",
    icon: "[&_svg]:size-[var(--space-6)]",
    iconWrap: "size-[var(--space-6)]",
  },
  xl: {
    height: buttonSizes.xl.height,
    paddingX: "px-[var(--space-6)]",
    gap: "gap-[var(--space-4)]",
    text: "text-title-lg",
    icon: "[&_svg]:size-[var(--space-7)]",
    iconWrap: "size-[var(--space-7)]",
  },
};

export const GlitchSegmentedGroup = ({
  value,
  onChange = () => {},
  ariaLabel,
  ariaLabelledby,
  children,
  className,
  size = "sm",
}: GlitchSegmentedGroupProps) => {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = (index: number) => (el: HTMLButtonElement | null) => {
    btnRefs.current[index] = el;
  };

  const values = React.Children.toArray(children).map((child) =>
    React.isValidElement(child)
      ? (child.props as GlitchSegmentedButtonProps).value
      : "",
  );

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

  return (
    <div
      role="tablist"
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        "inline-flex rounded-full bg-[var(--btn-bg)] p-[var(--space-1)] gap-[var(--space-1)]",
        "[--hover:hsl(var(--foreground)/0.08)] [--focus:hsl(var(--ring))] [--active:hsl(var(--foreground)/0.12)] [--disabled:0.5]",
        className,
      )}
      onKeyDown={onKeyDown}
    >
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement<GlitchSegmentedButtonProps>(child))
          return child;
        const selected = child.props.value === value;
        const buttonChild =
          child as React.ReactElement<GlitchSegmentedButtonProps>;
        const normalizedValue = normalizeValueForId(child.props.value);

        return React.cloneElement(buttonChild, {
          ref: setBtnRef(i),
          tabIndex: selected ? 0 : -1,
          selected,
          onSelect: () => onChange(child.props.value),
          size: buttonChild.props.size ?? size,
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
>(({ icon, children, className, selected, onSelect, size = "sm", ...rest }, ref) => {
  const sizeStyles = GLITCH_SEGMENTED_SIZE_STYLES[size] ??
    GLITCH_SEGMENTED_SIZE_STYLES.sm;
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
        "flex-1 inline-flex items-center justify-center font-medium select-none",
        "rounded-full transition focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[var(--focus)]",
        "bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[--hover] active:bg-[--active]",
        "motion-safe:hover:-translate-y-px motion-safe:hover:shadow-neon-soft",
        "motion-safe:active:shadow-neon-soft motion-safe:active:scale-95 motion-reduce:transform-none",
        "data-[selected=true]:shadow-neon-strong data-[selected=true]:ring-1 data-[selected=true]:ring-[var(--neon-soft)]",
        "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
        sizeStyles.height,
        sizeStyles.paddingX,
        sizeStyles.gap,
        sizeStyles.text,
        sizeStyles.icon,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span
          className={cn(
            "inline-flex items-center justify-center",
            sizeStyles.iconWrap,
          )}
        >
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
