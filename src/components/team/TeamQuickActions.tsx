"use client";

import * as React from "react";
import Link from "next/link";
import Badge, { type BadgeProps } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";

const LIST_CLASSNAME =
  "flex flex-wrap items-start gap-x-[var(--space-2)] gap-y-[var(--space-2)] chip-gap-x-tight chip-gap-y-tight";

const CHIP_CLASSNAME = cn(
  "min-w-0 max-w-full truncate text-left overflow-hidden text-ellipsis",
  "hover:bg-muted/28",
  "focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]",
  "transition-colors duration-quick ease-out motion-reduce:transition-none",
);

const TOOLTIP_CLASSNAME = cn(
  "pointer-events-none absolute left-1/2 top-full z-20 w-max max-w-[min(20rem,calc(100vw-var(--space-6)))] -translate-x-1/2",
  "rounded-[var(--radius-lg)] border border-card-hairline bg-[hsl(var(--surface-2))] px-[var(--space-3)] py-[var(--space-2)]",
  "text-label font-medium text-foreground shadow-depth-soft",
  "transition-[opacity,transform] duration-quick ease-out motion-reduce:transition-none motion-reduce:transform-none",
);

type TeamQuickAction = {
  id?: string;
  href: string;
  label: string;
  tone?: BadgeProps["tone"];
};

type TeamQuickActionsProps = {
  actions: TeamQuickAction[];
  className?: string;
};

type TooltipState = {
  id: string;
};

export default function TeamQuickActions({
  actions,
  className,
}: TeamQuickActionsProps) {
  const listId = React.useId();
  const [tooltip, setTooltip] = React.useState<TooltipState | null>(null);

  const closeTooltip = React.useCallback(() => {
    setTooltip(null);
  }, []);

  React.useEffect(() => {
    if (!tooltip) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        closeTooltip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tooltip, closeTooltip]);

  if (actions.length === 0) {
    return null;
  }

  return (
    <ul role="list" className={cn("list-none p-0", LIST_CLASSNAME, className)}>
      {actions.map((action, index) => {
        const { id, href, label, tone = "neutral" } = action;
        const key = id ?? href;
        const actionId = `${listId}-${index}`;
        const tooltipId = `${actionId}-tooltip`;
        const isTooltipOpen = tooltip?.id === actionId;

        const handleOpen = () => {
          setTooltip({ id: actionId });
        };

        const handleClose = (event: React.FocusEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement>) => {
          const target = event.currentTarget;
          if (
            event.type === "mouseleave" &&
            target instanceof HTMLElement &&
            target === document.activeElement
          ) {
            return;
          }
          setTooltip((prev) => (prev?.id === actionId ? null : prev));
        };

        const handleKeyDown: React.KeyboardEventHandler<HTMLAnchorElement> = (event) => {
          if (event.key === "Escape" || event.key === "Esc") {
            closeTooltip();
          }
        };

        return (
          <li key={key} role="listitem" className="relative">
            <Badge
              as={Link}
              href={href}
              tone={tone}
              size="lg"
              interactive
              className={cn(
                "flex min-w-[min(100%,12rem)] max-w-full justify-start whitespace-nowrap",
                CHIP_CLASSNAME,
              )}
              aria-describedby={isTooltipOpen ? tooltipId : undefined}
              onFocus={handleOpen}
              onBlur={handleClose}
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              onKeyDown={handleKeyDown}
            >
              {label}
            </Badge>
            <div
              id={tooltipId}
              role="tooltip"
              className={cn(
                TOOLTIP_CLASSNAME,
                isTooltipOpen
                  ? "opacity-100 translate-y-[var(--space-2)]"
                  : "pointer-events-none opacity-0 -translate-y-[var(--space-1)]",
              )}
              aria-hidden={isTooltipOpen ? undefined : "true"}
            >
              <span className="block text-balance text-left text-[length:var(--font-label)] leading-tight">
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export type { TeamQuickAction };
