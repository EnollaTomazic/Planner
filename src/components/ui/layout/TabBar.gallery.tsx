"use client";

import * as React from "react";
import { Circle, CircleCheck, CircleDot } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import TabBar, { type TabItem } from "./TabBar";

const focusVisibleClassName =
  "outline-[var(--spacing-0-5)_solid_var(--ring-contrast)] outline-offset-[var(--spacing-0-5)] ring-2 ring-[var(--ring-contrast)] shadow-glow-md";
const hoverStateClassName =
  "text-foreground bg-[--hover] shadow-[var(--tab-shadow-hover,var(--tab-shadow))]";

const filterItems: TabItem<string>[] = [
  { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
  { key: "active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
  { key: "done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
  {
    key: "focus",
    label: "Focus-visible",
    icon: <Circle aria-hidden="true" />,
    className: focusVisibleClassName,
  },
];

const defaultItems: TabItem<string>[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "focus", label: "Focus-visible", className: focusVisibleClassName },
  { key: "c", label: "Disabled", disabled: true },
  { key: "d", label: "Syncing", loading: true },
];

const navigationItems: TabItem<string>[] = [
  { key: "reviews", label: "Reviews" },
  { key: "planner", label: "Planner" },
  { key: "goals", label: "Goals" },
  { key: "focus", label: "Focus-visible", className: focusVisibleClassName },
];

type TabBarStateSpec = {
  id: string;
  name: string;
  value: string;
  items: TabItem<string>[];
  code: string;
};

function createStateItems(stateItem: TabItem<string>): TabItem<string>[] {
  return [
    { key: "today", label: "Today" },
    stateItem,
    { key: "backlog", label: "Backlog" },
  ];
}

const TAB_BAR_STATES: readonly TabBarStateSpec[] = [
  {
    id: "default",
    name: "Default",
    value: "today",
    items: createStateItems({ key: "upcoming", label: "Upcoming" }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "backlog", label: "Backlog" },
  ]}
  value="today"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
  {
    id: "hover",
    name: "Hover",
    value: "today",
    items: createStateItems({
      key: "hover",
      label: "Hover",
      className: hoverStateClassName,
    }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "hover", label: "Hover", className: "${hoverStateClassName}" },
    { key: "backlog", label: "Backlog" },
  ]}
  value="today"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
  {
    id: "active",
    name: "Active",
    value: "active",
    items: createStateItems({ key: "active", label: "Active" }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "active", label: "Active" },
    { key: "backlog", label: "Backlog" },
  ]}
  value="active"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    value: "today",
    items: createStateItems({
      key: "focus",
      label: "Focus-visible",
      className: focusVisibleClassName,
    }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "focus", label: "Focus-visible", className: "${focusVisibleClassName}" },
    { key: "backlog", label: "Backlog" },
  ]}
  value="today"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    value: "today",
    items: createStateItems({ key: "disabled", label: "Disabled", disabled: true }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "disabled", label: "Disabled", disabled: true },
    { key: "backlog", label: "Backlog" },
  ]}
  value="today"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
  {
    id: "loading",
    name: "Loading",
    value: "today",
    items: createStateItems({ key: "loading", label: "Loading", loading: true }),
    code: `<TabBar
  items={[
    { key: "today", label: "Today" },
    { key: "loading", label: "Loading", loading: true },
    { key: "backlog", label: "Backlog" },
  ]}
  value="today"
  onValueChange={() => {}}
  ariaLabel="Tab state preview"
/>`,
  },
];

function TabBarStatePreview({ state }: { state: TabBarStateSpec }) {
  return (
    <TabBar
      items={state.items}
      value={state.value}
      onValueChange={() => {}}
      ariaLabel={`${state.name} tab state`}
    />
  );
}

function TabBarGalleryPreview() {
  const [filterTab, setFilterTab] = React.useState<string>(filterItems[1]?.key ?? "all");
  const [defaultTab, setDefaultTab] = React.useState<string>(defaultItems[0]?.key ?? "a");
  const [navigationTab, setNavigationTab] = React.useState<string>(
    navigationItems[0]?.key ?? "reviews",
  );

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <TabBar
        items={filterItems}
        value={filterTab}
        onValueChange={setFilterTab}
        ariaLabel="Filter goals"
      />
      <TabBar
        items={defaultItems}
        value={defaultTab}
        onValueChange={setDefaultTab}
        ariaLabel="Example tabs"
      />
      <TabBar
        items={navigationItems}
        value={navigationTab}
        onValueChange={setNavigationTab}
        ariaLabel="Planner areas"
      />
    </div>
  );
}

export default defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "tab-bar",
      name: "TabBar",
      description: "Segmented tab navigation with preset variants",
      kind: "primitive",
      tags: ["tabs", "navigation"],
      axes: [
        {
          id: "variant",
          label: "Variant",
          type: "variant",
          values: [
            { value: "Filters" },
            { value: "Default" },
            { value: "Navigation" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: TAB_BAR_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:tab-bar:variants",
        render: () => <TabBarGalleryPreview />,
      }),
      states: TAB_BAR_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:tab-bar:state:${state.id}`,
          render: () => <TabBarStatePreview state={state} />,
        }),
      })),
      code: `<TabBar
  items={[
    { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
    { key: "active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
    { key: "done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
    {
      key: "focus",
      label: "Focus-visible",
      icon: <Circle aria-hidden="true" />,
      className: "ring-2 ring-[var(--theme-ring)] ring-offset-0 outline-none",
    },
  ]}
  value="active"
  onValueChange={() => {}}
  ariaLabel="Filter goals"
/>

<TabBar
  items={[
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "focus", label: "Focus-visible", className: "ring-2 ring-[var(--theme-ring)] ring-offset-0 outline-none" },
    { key: "c", label: "Disabled", disabled: true },
    { key: "d", label: "Syncing", loading: true },
  ]}
  value="a"
  onValueChange={() => {}}
  ariaLabel="Example tabs"
/>

<TabBar
  items={[
    { key: "reviews", label: "Reviews" },
    { key: "planner", label: "Planner" },
    { key: "goals", label: "Goals" },
    { key: "focus", label: "Focus-visible", className: "ring-2 ring-[var(--theme-ring)] ring-offset-0 outline-none" },
  ]}
  value="reviews"
  onValueChange={() => {}}
  ariaLabel="Planner areas"
/>`,
    },
  ],
});
