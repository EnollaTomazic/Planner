"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlitchSegmentedGroupProps {
  value: string;
  onChange?: (v: string) => void;
  ariaLabel?: string;
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
  children,
  className,
}: GlitchSegmentedGroupProps) => {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = (index: number) => (el: HTMLButtonElement | null) => {
    btnRefs.current[index] = el;
  };

  const values = React.Children.toArray(children).map((child) =>
    React.isValidElement(child) ? (child.props as GlitchSegmentedButtonProps).value : ""
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
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-full bg-[var(--btn-bg)] p-0.5 gap-0.5", className)}
      onKeyDown={onKeyDown}
    >
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement<GlitchSegmentedButtonProps>(child)) return child;
        const selected = child.props.value === value;
        const buttonChild = child as React.ReactElement<GlitchSegmentedButtonProps>;
        return React.cloneElement(
          buttonChild,
          {
            ref: setBtnRef(i),
            tabIndex: selected ? 0 : -1,
            selected,
            onSelect: () => onChange(child.props.value),
            id: child.props.id ?? `${child.props.value}-tab`,
            "aria-controls": child.props["aria-controls"] ?? `${child.props.value}-panel`,
          } as Partial<GlitchSegmentedButtonProps> & React.RefAttributes<HTMLButtonElement>
        );
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
        "glitch-scanlines flex-1 h-9 px-3 inline-flex items-center justify-center gap-2 text-sm font-medium select-none",
        "rounded-full transition focus-visible:outline-none",
        "bg-[var(--btn-bg)] text-[var(--btn-fg)]",
        "hover:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
        "focus-visible:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
        "active:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)] active:scale-95",
        "data-[selected=true]:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
});

GlitchSegmentedButton.displayName = "GlitchSegmentedButton";
