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

const WeekPickerShellControls = ({ children }: WeekPickerShellSlotProps) => (
  <>{children}</>
);
WeekPickerShellControls.displayName = "WeekPickerShellControls";

type WeekPickerShellComponent = React.ForwardRefExoticComponent<
  WeekPickerShellProps & React.RefAttributes<HTMLDivElement>
> & {
  readonly Totals: typeof WeekPickerShellTotals;
  readonly Chips: typeof WeekPickerShellChips;
  readonly Controls: typeof WeekPickerShellControls;
};

const WeekPickerShellBase = React.forwardRef<HTMLDivElement, WeekPickerShellProps>(
  function WeekPickerShell({ children, className, ...props }, ref) {
    const totals: React.ReactElement<WeekPickerShellSlotProps>[] = [];
    const chips: React.ReactElement<WeekPickerShellSlotProps>[] = [];
    const controls: React.ReactElement<WeekPickerShellSlotProps>[] = [];
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

      if (child.type === WeekPickerShellControls) {
        controls.push(child as React.ReactElement<WeekPickerShellSlotProps>);
        return;
      }

      remainder.push(child);
    });

    const hasTopRow = totals.length > 0 || controls.length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          "week-picker-shell grid flex-1 min-w-0 w-full gap-[var(--space-4)] rounded-card r-card-lg border border-border/45 bg-card/70 card-pad shadow-neo-soft",
          "lg:gap-[var(--space-6)]",
          className,
        )}
        {...props}
      >
        {hasTopRow ? (
          <div className="week-picker-shell__top flex w-full flex-wrap items-center gap-[var(--space-3)]">
            {controls.length > 0 ? (
              <div className="week-picker-shell__controls flex flex-wrap items-center gap-[var(--space-2)]">
                {controls.map((slot) => {
                  const key = slot.key ?? slot.props.slotId;
                  return (
                    <React.Fragment key={key}>{slot.props.children}</React.Fragment>
                  );
                })}
              </div>
            ) : null}
            {totals.length > 0 ? (
              <div className="week-picker-shell__totals ml-auto flex flex-wrap items-center justify-end gap-[var(--space-3)]">
                {totals.map((slot) => {
                  const key = slot.key ?? slot.props.slotId;
                  return (
                    <React.Fragment key={key}>{slot.props.children}</React.Fragment>
                  );
                })}
              </div>
            ) : null}
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
  Controls: WeekPickerShellControls,
}) as WeekPickerShellComponent;

export default WeekPickerShell;
