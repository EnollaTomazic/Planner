"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/primitives/Card";
import {
  DashboardList,
  type DashboardListProps,
  type DashboardListRenderItem,
} from "./DashboardList";
import { Button } from "@/components/ui";
import { cn, withBasePath } from "@/lib/utils";

interface DashboardListCardFooterAction {
  label: React.ReactNode;
  href: string;
  size?: React.ComponentProps<typeof Button>["size"];
  tone?: React.ComponentProps<typeof Button>["tone"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}

type DashboardListCardHeaderProps = Omit<
  React.ComponentProps<typeof CardHeader>,
  "title"
> & {
  eyebrow?: React.ReactNode;
  eyebrowClassName?: string;
  title?: React.ReactNode;
  titleClassName?: string;
  description?: React.ReactNode;
  descriptionClassName?: string;
  actions?: React.ReactNode;
  actionsClassName?: string;
};

interface DashboardListCardProps<Item> {
  title?: React.ReactNode;
  items: readonly Item[];
  emptyMessage: DashboardListProps<Item>["empty"];
  renderItem: DashboardListRenderItem<Item>;
  listCta?: DashboardListProps<Item>["cta"];
  getKey?: DashboardListProps<Item>["getKey"];
  itemClassName?: DashboardListProps<Item>["itemClassName"];
  listClassName?: DashboardListProps<Item>["className"];
  bodyClassName?: string;
  headerProps?: DashboardListCardHeaderProps;
  footerProps?: React.ComponentProps<typeof CardFooter>;
  footerAction?: DashboardListCardFooterAction;
  headerAction?: DashboardListCardFooterAction;
  cardProps?: Omit<React.ComponentProps<typeof Card>, "children">;
}

function DashboardListHeader({
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  actions,
  actionsClassName,
  className,
  ...props
}: DashboardListCardHeaderProps) {
  return (
    <CardHeader
      {...props}
      className={cn("space-y-[var(--space-3)]", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          {eyebrow ? (
            <p
              className={cn(
                "text-label text-muted-foreground",
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3
              className={cn(
                "text-body font-semibold text-card-foreground tracking-[-0.01em]",
                titleClassName,
              )}
            >
              {title}
            </h3>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-label text-muted-foreground",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-[var(--space-2)] text-right",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </CardHeader>
  );
}

function DashboardListCard<Item>({
  title,
  items,
  emptyMessage,
  renderItem,
  listCta,
  getKey,
  itemClassName,
  listClassName,
  bodyClassName,
  headerProps,
  footerProps,
  footerAction,
  headerAction,
  cardProps,
}: DashboardListCardProps<Item>): React.ReactElement {
  const {
    className: headerClassName,
    title: headerTitle,
    eyebrow,
    eyebrowClassName,
    titleClassName,
    description,
    descriptionClassName,
    actions: headerPropActions,
    actionsClassName: headerPropActionsClassName,
    ...restHeaderProps
  } = headerProps ?? {};
  const { className: footerClassName, ...restFooterProps } = footerProps ?? {};
  const { className: cardClassName, ...restCardProps } = cardProps ?? {};
  const resolvedTitle = headerTitle ?? title;
  const headerHref = headerAction
    ? withBasePath(headerAction.href, { skipForNextLink: true })
    : undefined;
  const headerButton =
    headerPropActions ??
    (headerAction && headerHref ? (
      <Button
        asChild
        size={headerAction.size ?? "sm"}
        tone={headerAction.tone}
        variant={headerAction.variant ?? "quiet"}
      >
        <Link href={headerHref}>{headerAction.label}</Link>
      </Button>
    ) : undefined);
  const headerActionsClassName =
    headerPropActionsClassName ??
    (headerAction ? "justify-end" : undefined);

  return (
    <Card className={cardClassName} {...restCardProps}>
      <DashboardListHeader
        {...restHeaderProps}
        className={headerClassName}
        eyebrow={eyebrow}
        eyebrowClassName={eyebrowClassName}
        title={resolvedTitle}
        titleClassName={titleClassName}
        description={description}
        descriptionClassName={descriptionClassName}
        actions={headerButton}
        actionsClassName={headerActionsClassName}
      />
      <CardBody className={cn("text-card-foreground", bodyClassName)}>
        <DashboardList
          items={items}
          renderItem={renderItem}
          empty={emptyMessage}
          cta={listCta}
          getKey={getKey}
          itemClassName={itemClassName}
          className={listClassName}
        />
      </CardBody>
      {footerAction ? (
        <CardFooter
          className={cn(
            "flex justify-end border-t border-card-hairline/60 text-card-foreground",
            footerClassName,
          )}
          {...restFooterProps}
        >
          <Button
            asChild
            size={footerAction.size ?? "sm"}
            tone={footerAction.tone}
            variant={footerAction.variant}
          >
            <Link href={withBasePath(footerAction.href, { skipForNextLink: true })}>
              {footerAction.label}
            </Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export { DashboardListCard };
export type { DashboardListCardProps, DashboardListCardFooterAction };
