"use client";

import * as React from "react";
import TabBar, { type TabBarProps, type TabItem } from "./layout/TabBar";

export type { TabBarProps, TabItem };

export default function SegmentedButtons<K extends string = string>(
  props: TabBarProps<K>,
) {
  return <TabBar {...props} />;
}
