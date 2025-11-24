import type * as React from "react";
import { NAV_ITEMS } from "@/config/nav";

export interface HeaderNavItem {
  key: string;
  label: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  active?: boolean;
  icon?: React.ReactNode;
}

const deriveNavKey = (href: string) => {
  if (!href || href === "/") {
    return "home";
  }

  return href
    .replace(/^\//, "")
    .replace(/\/+/g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase();
};

const primaryNavItems = Array.isArray(NAV_ITEMS) ? NAV_ITEMS : [];

export const PRIMARY_PAGE_NAV = primaryNavItems.map((item) => ({
  key: deriveNavKey(item.href),
  label: item.label,
  href: item.href,
})) satisfies ReadonlyArray<HeaderNavItem>;

export type PrimaryPageNavKey = (typeof PRIMARY_PAGE_NAV)[number]["key"];
