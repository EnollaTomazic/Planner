"use client";

import * as React from "react";
import TabBar, { type TabBarProps, type TabItem } from "./layout/TabBar";

export type { TabItem };

export interface TabSelectorProps<K extends string = string>
  extends Omit<TabBarProps<K>, "items"> {
  tabs: TabItem<K>[];
}

export default function TabSelector<K extends string = string>({
  tabs,
  ...props
}: TabSelectorProps<K>) {
  return <TabBar items={tabs} {...props} />;
}
