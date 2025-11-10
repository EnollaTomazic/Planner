"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
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

type QuickActionHref = LinkProps["href"];

type QuickActionButtonProps = Omit<
  Extract<ButtonProps, { asChild?: false; href?: undefined }>,
  "tone" | "size" | "variant" | "className" | "children" | "asChild"
>;

interface QuickActionBase {
  readonly id?: string;
  readonly tone?: ButtonProps["tone"];
  readonly className?: string;
  readonly size?: ButtonProps["size"];
  readonly variant?: ButtonProps["variant"];
  readonly ariaLabel?: string;
}

interface QuickActionButtonDefinition extends QuickActionBase {
  readonly type: "button";
  readonly label?: React.ReactNode;
  readonly content?: React.ReactNode;
  readonly buttonProps?: QuickActionButtonProps;
}

interface QuickActionLinkDefinition extends QuickActionBase {
  readonly type: "link";
  readonly href: QuickActionHref;
  readonly label: React.ReactNode;
  readonly linkProps?: Omit<React.ComponentProps<typeof Link>, "href" | "children">;
}

type QuickActionDefinition =
  | QuickActionButtonDefinition
  | QuickActionLinkDefinition;

interface QuickActionGridProps<
  TAction extends QuickActionDefinition = QuickActionDefinition,
> {
  readonly actions: readonly TAction[];
  readonly layout?: QuickActionLayout;
  readonly className?: string;
  readonly buttonClassName?: string;
  readonly buttonSize?: ButtonProps["size"];
  readonly buttonTone?: ButtonProps["tone"];
  readonly buttonVariant?: ButtonProps["variant"];
  readonly hoverLift?: boolean;
}

export function QuickActionGrid({
  actions,
  layout = "stacked",
  className,
  buttonClassName,
  buttonSize = "md",
  buttonTone = "primary",
  buttonVariant = "neo",
  hoverLift = false,
}: QuickActionGridProps) {
  return (
    <div className={cn(ROOT_CLASSNAME, layoutClassNames[layout], className)}>
      {actions.map((action, index) => {
        const {
          id,
          tone,
          className: actionClassName,
          size,
          variant,
          ariaLabel,
        } = action;
        const resolvedTone = tone ?? buttonTone;
        const resolvedSize = size ?? buttonSize;
        const resolvedVariant = variant ?? buttonVariant;
        const mergedClassName = cn(
          buttonBaseClassName,
          hoverLift && buttonHoverLiftClassName,
          buttonClassName,
          actionClassName,
        );
        const commonButtonProps = {
          tone: resolvedTone,
          size: resolvedSize,
          variant: resolvedVariant,
          className: mergedClassName,
        } satisfies Pick<
          ButtonProps,
          "tone" | "size" | "variant" | "className"
        >;

        if (action.type === "link") {
          const { href, label, linkProps } = action;
          const hrefIsString = typeof href === "string";
          const trimmedHref = hrefIsString ? href.trim() : "";
          const key =
            id ??
            (hrefIsString
              ? trimmedHref || `${index}`
              : href !== undefined
                ? JSON.stringify(href)
                : undefined) ??
            `${index}`;
          const isHash = hrefIsString && trimmedHref.startsWith("#");
          const isExternal = hrefIsString && isExternalHref(trimmedHref);
          const shouldPrefixBasePathForAnchor =
            hrefIsString &&
            trimmedHref.length > 0 &&
            !isHash &&
            !isExternal;
          const anchorHref = shouldPrefixBasePathForAnchor
            ? withBasePath(trimmedHref)
            : hrefIsString && trimmedHref.length > 0
              ? trimmedHref
              : "#";
          const linkHref: QuickActionHref = hrefIsString
            ? withBasePath(trimmedHref)
            : typeof href === "object" &&
                href !== null &&
                "pathname" in href &&
                typeof href.pathname === "string"
              ? {
                  ...href,
                  pathname: withBasePath(href.pathname),
                }
              : href;
          const {
            className: _omitClassName,
            target,
            rel,
            ["aria-label"]: ariaLabelOverride,
            ...restLinkProps
          } = linkProps ?? {};
          void _omitClassName;
          const resolvedRel =
            target === "_blank" && typeof rel === "undefined"
              ? "noopener noreferrer"
              : rel;
          const resolvedAriaLabel = ariaLabel ?? ariaLabelOverride;

          const childNode = isExternal || isHash ? (
            <a
              href={anchorHref}
              target={target}
              rel={resolvedRel}
              aria-label={resolvedAriaLabel}
              {...(restLinkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
              {label}
            </a>
          ) : (
            <Link
              href={linkHref}
              target={target}
              rel={resolvedRel}
              aria-label={resolvedAriaLabel}
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
        }

        const { label, content, buttonProps } = action;
        const key = id ?? `${index}`;
        const { ["aria-label"]: ariaLabelOverride, ...restButtonProps } =
          buttonProps ?? {};
        const resolvedAriaLabel = ariaLabel ?? ariaLabelOverride;

        return (
          <Button
            key={key}
            {...commonButtonProps}
            {...restButtonProps}
            aria-label={resolvedAriaLabel}
          >
            {content ?? label}
          </Button>
        );
      })}
    </div>
  );
}
