"use client";

import * as React from "react";
import Link from "next/link";

import { Card, type CardProps } from "./Card";
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

interface DashboardListCardProps<Item> {
  title?: React.ComponentProps<typeof Card.Header>["title"];
  items: readonly Item[];
  emptyMessage: DashboardListProps<Item>["empty"];
  renderItem: DashboardListRenderItem<Item>;
  listCta?: DashboardListProps<Item>["cta"];
  getKey?: DashboardListProps<Item>["getKey"];
  itemClassName?: DashboardListProps<Item>["itemClassName"];
  listClassName?: DashboardListProps<Item>["className"];
  bodyClassName?: string;
  headerProps?: React.ComponentProps<typeof Card.Header>;
  footerProps?: React.ComponentProps<typeof Card.Footer>;
  footerAction?: DashboardListCardFooterAction;
  cardProps?: Omit<CardProps, "children">;
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
  cardProps,
}: DashboardListCardProps<Item>): React.ReactElement {
  const {
    className: headerClassName,
    title: headerTitle,
    ...restHeaderProps
  } = headerProps ?? {};
  const { className: footerClassName, ...restFooterProps } = footerProps ?? {};
  const { className: cardClassName, ...restCardProps } = cardProps ?? {};
  const resolvedTitle = headerTitle ?? title;

  return (
    <Card className={cardClassName} {...restCardProps}>
      <Card.Header
        title={resolvedTitle}
        className={headerClassName}
        {...restHeaderProps}
      />
      <Card.Body className={cn("text-card-foreground", bodyClassName)}>
        <DashboardList
          items={items}
          renderItem={renderItem}
          empty={emptyMessage}
          cta={listCta}
          getKey={getKey}
          itemClassName={itemClassName}
          className={listClassName}
        />
      </Card.Body>
      {footerAction ? (
        <Card.Footer
          className={cn("flex justify-end text-card-foreground", footerClassName)}
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
        </Card.Footer>
      ) : null}
    </Card>
  );
}

export { DashboardListCard };
export type { DashboardListCardProps };
