"use client";

import * as React from "react";
import Link from "next/link";
import Button, { type ButtonProps } from "@/components/ui/primitives/Button";
import { cn } from "@/lib/utils";

type QuickActionLayout = "stacked" | "grid";

const ROOT_CLASSNAME =
  "[--quick-actions-gap:var(--space-4)] [--quick-actions-column-width:calc(var(--space-4)*14)] [--quick-actions-lift:var(--spacing-0-5)]";

const layoutClassNames: Record<QuickActionLayout, string> = {
  stacked: "flex flex-col gap-[var(--quick-actions-gap)]",
  grid: "grid grid-cols-1 gap-[var(--quick-actions-gap)] sm:grid-cols-[repeat(auto-fit,minmax(var(--quick-actions-column-width),1fr))]",
};

const buttonBaseClassName =
  "rounded-[var(--control-radius)] [--focus:var(--theme-ring)] focus-visible:ring-offset-0 transition-transform duration-[var(--dur-quick)] ease-out motion-reduce:transition-none";

type QuickActionDefinition = {
  href: string;
  label: React.ReactNode;
  tone?: ButtonProps["tone"];
  asChild?: boolean;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  linkProps?: Omit<React.ComponentProps<typeof Link>, "href" | "children">;
};

type QuickActionGridProps = {
  actions: QuickActionDefinition[];
  layout?: QuickActionLayout;
  className?: string;
  buttonClassName?: string;
  buttonSize?: ButtonProps["size"];
  buttonTone?: ButtonProps["tone"];
  buttonVariant?: ButtonProps["variant"];
};

export default function QuickActionGrid({
  actions,
  layout = "stacked",
  className,
  buttonClassName,
  buttonSize = "md",
  buttonTone = "primary",
  buttonVariant = "secondary",
}: QuickActionGridProps) {
  return (
    <div className={cn(ROOT_CLASSNAME, layoutClassNames[layout], className)}>
      {actions.map((action, index) => {
        const {
          href,
          label,
          tone,
          asChild,
          className: actionClassName,
          size,
          variant,
          linkProps,
        } = action;
        const key = `${href}-${index}`;
        const resolvedTone = tone ?? buttonTone;
        const resolvedSize = size ?? buttonSize;
        const resolvedVariant = variant ?? buttonVariant;
        const mergedClassName = cn(
          buttonBaseClassName,
          buttonClassName,
          actionClassName,
        );

        if (asChild) {
          return (
            <Button
              key={key}
              asChild
              tone={resolvedTone}
              size={resolvedSize}
              variant={resolvedVariant}
              className={mergedClassName}
            >
              <Link href={href} {...linkProps}>
                {label}
              </Link>
            </Button>
          );
        }

        const target = linkProps?.target;
        const rel = linkProps?.rel;

        return (
          <Button
            key={key}
            href={href}
            tone={resolvedTone}
            size={resolvedSize}
            variant={resolvedVariant}
            className={mergedClassName}
            target={target}
            rel={rel}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
