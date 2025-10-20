"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export type AIExplainTooltipAlignment = "start" | "center" | "end";
export type AIExplainTooltipTone = "accent" | "neutral";
type TriggerElement = HTMLButtonElement | HTMLAnchorElement;

export interface AIExplainTooltipProps extends React.ComponentPropsWithoutRef<"div"> {
  readonly triggerLabel: string;
  readonly explanation: React.ReactNode;
  readonly shortcutHint?: string;
  readonly icon?: React.ReactNode;
  readonly alignment?: AIExplainTooltipAlignment;
  readonly tone?: AIExplainTooltipTone;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly triggerProps?: React.ComponentPropsWithoutRef<typeof Button>;
}

const toneBackground: Record<AIExplainTooltipTone, string> = {
  accent: "bg-[hsl(var(--accent-soft))] border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent-foreground))]",
  neutral: "bg-[hsl(var(--surface)/0.9)] border-[hsl(var(--border)/0.6)] text-foreground",
};

const AIExplainTooltip = React.forwardRef<HTMLDivElement, AIExplainTooltipProps>(
  (
    {
      triggerLabel,
      explanation,
      shortcutHint,
      icon,
      alignment = "start",
      tone = "accent",
      open,
      defaultOpen,
      onOpenChange,
      triggerProps,
      className,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const tooltipId = React.useMemo(() => {
      const sanitizedId = reactId.replace(/[^a-zA-Z0-9]+/g, "");
      return `:${sanitizedId}:`;
    }, [reactId]);
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : uncontrolledOpen;

    const setOpen = React.useCallback(
      (value: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(value);
        }
        onOpenChange?.(value);
      },
      [isControlled, onOpenChange],
    );

    const handleToggle = React.useCallback(() => {
      setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const close = React.useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<TriggerElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      },
      [close],
    );

    const handleFocus = React.useCallback(() => {
      setOpen(true);
    }, [setOpen]);

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<TriggerElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          close();
        }
      },
      [close],
    );

    const handlePointerEnter = React.useCallback(() => {
      setOpen(true);
    }, [setOpen]);

    const handlePointerLeave = React.useCallback(() => {
      close();
    }, [close]);

    const {
      className: triggerClassName,
      onClick: onTriggerClick,
      onFocus: onTriggerFocus,
      onBlur: onTriggerBlur,
      onPointerEnter: onTriggerPointerEnter,
      onPointerLeave: onTriggerPointerLeave,
      onKeyDown: onTriggerKeyDown,
      tone: triggerTone,
      ...restTriggerProps
    } = triggerProps ?? {};

    const resolvedTone = triggerTone ?? (tone === "accent" ? "accent" : "primary");

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex flex-col items-start", className)}
        {...props}
      >
        <Button
          type="button"
          size="sm"
          variant="quiet"
          tone={resolvedTone}
          aria-expanded={isOpen}
          aria-controls={tooltipId}
          aria-describedby={isOpen ? tooltipId : undefined}
          onClick={(event: React.MouseEvent<TriggerElement>) => {
            const clickHandler =
              onTriggerClick as ((event: React.MouseEvent<TriggerElement>) => void) | undefined;
            clickHandler?.(event);
            if (!event.defaultPrevented) {
              handleToggle();
            }
          }}
          onKeyDown={(event: React.KeyboardEvent<TriggerElement>) => {
            const keyHandler =
              onTriggerKeyDown as ((event: React.KeyboardEvent<TriggerElement>) => void) | undefined;
            keyHandler?.(event);
            if (!event.defaultPrevented) {
              handleKeyDown(event);
            }
          }}
          onFocus={(event: React.FocusEvent<TriggerElement>) => {
            const focusHandler =
              onTriggerFocus as ((event: React.FocusEvent<TriggerElement>) => void) | undefined;
            focusHandler?.(event);
            if (!event.defaultPrevented) {
              handleFocus();
            }
          }}
          onBlur={(event: React.FocusEvent<TriggerElement>) => {
            const blurHandler =
              onTriggerBlur as ((event: React.FocusEvent<TriggerElement>) => void) | undefined;
            blurHandler?.(event);
            if (!event.defaultPrevented) {
              handleBlur(event);
            }
          }}
          onPointerEnter={(event: React.PointerEvent<TriggerElement>) => {
            const pointerEnterHandler =
              onTriggerPointerEnter as ((event: React.PointerEvent<TriggerElement>) => void) | undefined;
            pointerEnterHandler?.(event);
            if (!event.defaultPrevented) {
              handlePointerEnter();
            }
          }}
          onPointerLeave={(event: React.PointerEvent<TriggerElement>) => {
            const pointerLeaveHandler =
              onTriggerPointerLeave as ((event: React.PointerEvent<TriggerElement>) => void) | undefined;
            pointerLeaveHandler?.(event);
            if (!event.defaultPrevented) {
              handlePointerLeave();
            }
          }}
          className={cn("gap-[var(--space-1-5)] px-[var(--space-3)]", triggerClassName)}
          {...restTriggerProps}
        >
          {icon ?? <Info className="size-[var(--space-4)]" aria-hidden />}
          <span>{triggerLabel}</span>
        </Button>
        <div
          id={tooltipId}
          role="tooltip"
          data-state={isOpen ? "open" : "closed"}
          aria-hidden={isOpen ? undefined : "true"}
          className={cn(
            "pointer-events-none absolute z-10 mt-[var(--space-2)] min-w-[min(22rem,calc(100vw-2rem))] rounded-card border p-[var(--space-3)] text-left shadow-[var(--shadow-outline-subtle)] opacity-0 -translate-y-[var(--space-1)] transition-[opacity,transform] duration-motion-sm ease-out motion-reduce:transition-none motion-reduce:transform-none data-[state=open]:opacity-100 data-[state=open]:translate-y-0",
            toneBackground[tone],
            alignClassNames[alignment],
          )}
        >
          <div className="flex flex-col gap-[var(--space-1-5)]">
            <p className="text-label font-medium leading-snug">{explanation}</p>
            {shortcutHint ? (
              <p className="text-caption opacity-80">{shortcutHint}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

AIExplainTooltip.displayName = "AIExplainTooltip";
const alignClassNames: Record<AIExplainTooltipAlignment, string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2 transform",
  end: "right-0",
};

export { AIExplainTooltip };
