"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type WeekPickerShellProps = React.HTMLAttributes<HTMLDivElement>;

interface WeekPickerShellSlotProps {
  readonly slotId: string;
  readonly children: React.ReactNode;
}

const WeekPickerShellTotals = ({ children }: WeekPickerShellSlotProps) => (
  <>{children}</>
);
WeekPickerShellTotals.displayName = "WeekPickerShellTotals";

const WeekPickerShellChips = ({ children }: WeekPickerShellSlotProps) => (
  <>{children}</>
);
WeekPickerShellChips.displayName = "WeekPickerShellChips";

type WeekPickerShellComponent = React.ForwardRefExoticComponent<
  WeekPickerShellProps & React.RefAttributes<HTMLDivElement>
> & {
  readonly Totals: typeof WeekPickerShellTotals;
  readonly Chips: typeof WeekPickerShellChips;
};

const WeekPickerShellBase = React.forwardRef<HTMLDivElement, WeekPickerShellProps>(
  function WeekPickerShell({ children, className, ...props }, ref) {
    const totals: React.ReactElement<WeekPickerShellSlotProps>[] = [];
    const chips: React.ReactElement<WeekPickerShellSlotProps>[] = [];
    const remainder: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        if (child != null) {
          remainder.push(child);
        }
        return;
      }

      if (child.type === WeekPickerShellTotals) {
        totals.push(child as React.ReactElement<WeekPickerShellSlotProps>);
        return;
      }

      if (child.type === WeekPickerShellChips) {
        chips.push(child as React.ReactElement<WeekPickerShellSlotProps>);
        return;
      }

      remainder.push(child);
    });

    return (
      <div
        ref={ref}
        className={cn(
          "week-picker-shell grid flex-1 min-w-0 w-full gap-[var(--space-3)] rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft",
          "md:gap-[var(--space-4)] md:p-[var(--space-4)]",
          className,
        )}
        {...props}
      >
        {totals.length > 0 ? (
          <div className="week-picker-shell__totals flex flex-wrap items-center justify-end gap-[var(--space-3)]">
            {totals.map((slot) => {
              const key = slot.key ?? slot.props.slotId;
              return (
                <React.Fragment key={key}>{slot.props.children}</React.Fragment>
              );
            })}
          </div>
        ) : null}
        {chips.map((slot) => {
          const key = slot.key ?? slot.props.slotId;
          return <React.Fragment key={key}>{slot.props.children}</React.Fragment>;
        })}
        {remainder}
      </div>
    );
  },
);

WeekPickerShellBase.displayName = "WeekPickerShell";

const WeekPickerShell = Object.assign(WeekPickerShellBase, {
  Totals: WeekPickerShellTotals,
  Chips: WeekPickerShellChips,
}) as WeekPickerShellComponent;

export default WeekPickerShell;
