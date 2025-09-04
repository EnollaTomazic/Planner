"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedGroupProps {
  /** Current value */
  value: string;
  /** Called when a new value is selected */
  onChange: (v: string) => void;
  /** Accessible label for the group */
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export interface SegmentedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** The unique value for this segment */
  value: string;
  /** Optional icon placed to the left */
  icon?: React.ReactNode;
  /** Internal: set by the group */
  selected?: boolean;
  /** Internal: select handler */
  onSelect?: () => void;
}

export const SegmentedGroup = ({
  value,
  onChange,
  ariaLabel,
  children,
  className,
}: SegmentedGroupProps) => {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = (index: number) => (el: HTMLButtonElement | null) => {
    btnRefs.current[index] = el;
  };

  const values = React.Children.toArray(children).map((child) =>
    React.isValidElement(child) ? (child.props as SegmentedButtonProps).value : ""
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
      className={cn(
        "inline-flex rounded-full bg-[hsl(var(--surface-1))] p-0.5",
        className
      )}
      onKeyDown={onKeyDown}
    >
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement<SegmentedButtonProps>(child)) return child;
        const selected = child.props.value === value;
        return React.cloneElement(
          child as React.ReactElement<any>,
          {
            ref: setBtnRef(i),
            tabIndex: selected ? 0 : -1,
            selected,
            onSelect: () => onChange(child.props.value),
            id: child.props.id ?? `${child.props.value}-tab`,
            "aria-controls": child.props["aria-controls"] ?? `${child.props.value}-panel`,
          } as any
        );
      })}
    </div>
  );
};

export const SegmentedButton = React.forwardRef<
  HTMLButtonElement,
  SegmentedButtonProps
>(
  ({ icon, children, className, selected, onSelect, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        data-selected={selected ? "true" : undefined}
        onClick={onSelect}
        className={cn(
          "flex-1 select-none whitespace-nowrap rounded-full px-3 h-9 inline-flex items-center justify-center gap-1 text-sm",
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-foreground))] shadow-[inset_0_0_0_1px_hsl(var(--surface-3))]",
          "motion-safe:transition-[color,box-shadow,transform] motion-safe:ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:duration-[120ms]",
          "hover:shadow-[0_0_0_1px_hsl(var(--accent)/.25),0_0_8px_hsl(var(--accent)/.15)] hover:text-[hsl(var(--foreground))]",
          "active:scale-[0.98] motion-safe:active:duration-[80ms] active:shadow-[0_0_0_1px_hsl(var(--accent)),0_0_10px_hsl(var(--accent)/.6)]",
          "data-[selected=true]:bg-[hsl(var(--accent))] data-[selected=true]:text-[hsl(var(--accent-foreground))] data-[selected=true]:shadow-[0_0_0_1px_hsl(var(--accent)),0_0_8px_hsl(var(--accent)/.5)] data-[selected=true]:motion-safe:duration-[160ms]",
          "focus-visible:outline-none data-[selected=true]:focus-visible:ring-2 data-[selected=true]:focus-visible:ring-[hsl(var(--ring))] data-[selected=true]:focus-visible:ring-offset-2 data-[selected=true]:focus-visible:ring-offset-[hsl(var(--accent))]",
          "motion-reduce:transition-none motion-reduce:transform-none",
          className
        )}
        {...rest}
      >
        {icon ? <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">{icon}</span> : null}
        <span className="truncate">{children}</span>
      </button>
    );
  }
);
SegmentedButton.displayName = "SegmentedButton";

export default SegmentedGroup;
