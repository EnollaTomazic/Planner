"use client";

import * as React from "react";
import Link from "next/link";
import { type ButtonProps, Button } from "@/components/ui/primitives/Button";
import { cn, withBasePath } from "@/lib/utils";

type QuickActionLayout = "stacked" | "grid" | "twelveColumn" | "inline";

const ROOT_CLASSNAME =
  "[--quick-actions-gap:var(--space-4)] [--quick-actions-column-width:calc(var(--space-4)*14)] [--quick-actions-lift:var(--spacing-0-5)] md:[--quick-actions-gap:var(--space-3)]";

const layoutClassNames: Record<QuickActionLayout, string> = {
  stacked:
    "grid grid-cols-1 gap-[var(--quick-actions-gap)] md:grid-flow-col md:[grid-auto-columns:minmax(var(--quick-actions-column-width),1fr)] md:justify-start",
  grid: "grid grid-cols-1 gap-[var(--quick-actions-gap)] sm:grid-cols-[repeat(auto-fit,minmax(var(--quick-actions-column-width),1fr))]",
  twelveColumn: "grid grid-cols-12 gap-[var(--quick-actions-gap)]",
  inline:
    "flex flex-col gap-[var(--quick-actions-gap)] md:flex-row md:flex-wrap md:items-center md:justify-start",
};

const buttonBaseClassName =
  "rounded-[var(--control-radius)] focus-visible:ring-offset-0 transition-transform duration-motion-sm ease-out motion-reduce:transition-none";

const buttonHoverLiftClassName =
  "motion-safe:hover:-translate-y-[var(--quick-actions-lift)] motion-safe:focus-visible:-translate-y-[var(--quick-actions-lift)] motion-reduce:transform-none";

const isExternalHref = (href: string): boolean => {
  if (href.startsWith("/")) return false;
  if (href.startsWith("#")) return false;
  return /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/)/.test(href);
};

type QuickActionDefinition = {
  id?: string;
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
  hoverLift?: boolean;
};

export function QuickActionGrid({
  actions,
  layout = "stacked",
  className,
  buttonClassName,
  buttonSize = "md",
  buttonTone = "primary",
  buttonVariant = "secondary",
  hoverLift = false,
}: QuickActionGridProps) {
  return (
    <div className={cn(ROOT_CLASSNAME, layoutClassNames[layout], className)}>
      {actions.map((action) => {
        const {
          id,
          href,
          label,
          tone,
          asChild,
          className: actionClassName,
          size,
          variant,
          linkProps,
        } = action;
        void asChild;
        const key = id ?? href;
        const resolvedTone = tone ?? buttonTone;
        const resolvedSize = size ?? buttonSize;
        const resolvedVariant = variant ?? buttonVariant;
        const mergedClassName = cn(
          buttonBaseClassName,
          hoverLift && buttonHoverLiftClassName,
          buttonClassName,
          actionClassName,
        );
        const trimmedHref = href.trim();
        const isHash = trimmedHref.startsWith("#");
        const isExternal = isExternalHref(trimmedHref);
        const shouldPrefixBasePathForAnchor = !isHash && !isExternal;
        const anchorHref = shouldPrefixBasePathForAnchor
          ? withBasePath(trimmedHref)
          : trimmedHref;
        const linkHref = trimmedHref;
        const {
          className: _omitClassName,
          target,
          rel,
          ...restLinkProps
        } = linkProps ?? {};
        void _omitClassName;
        const commonButtonProps = {
          tone: resolvedTone,
          size: resolvedSize,
          variant: resolvedVariant,
          className: mergedClassName,
        } satisfies Pick<
          ButtonProps,
          "tone" | "size" | "variant" | "className"
        >;
        const resolvedRel =
          target === "_blank" && typeof rel === "undefined"
            ? "noopener noreferrer"
            : rel;

        const childNode = isExternal || isHash ? (
          <a
            href={anchorHref}
            target={target}
            rel={resolvedRel}
            {...(restLinkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {label}
          </a>
        ) : (
          <Link
            href={linkHref}
            target={target}
            rel={resolvedRel}
            {...restLinkProps}
          >
            {label}
          </Link>
        );

        return (
          <Button key={key} {...commonButtonProps} asChild>
            {childNode}
          </Button>
        );
      })}
    </div>
  );
}
