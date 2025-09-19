import * as React from "react";
import { Circle, CircleCheck, CircleDot } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery";

import TabBar, { type TabItem } from "./TabBar";

const filterItems: TabItem<string>[] = [
  { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
  { key: "active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
  { key: "done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
];

const defaultItems: TabItem<string>[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "Disabled", disabled: true },
  { key: "d", label: "Syncing", loading: true },
];

const navigationItems: TabItem<string>[] = [
  { key: "reviews", label: "Reviews" },
  { key: "planner", label: "Planner" },
  { key: "goals", label: "Goals" },
];

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
          values: [
            { value: "Active" },
            { value: "Disabled" },
            { value: "Loading" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:tab-bar:variants",
        render: () => <TabBarGalleryPreview />,
      }),
      code: `<TabBar
  items={[
    { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
    { key: "active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
    { key: "done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
  ]}
  value="active"
  onValueChange={() => {}}
  ariaLabel="Filter goals"
/>

<TabBar
  items={[
    { key: "a", label: "A" },
    { key: "b", label: "B" },
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
  ]}
  value="reviews"
  onValueChange={() => {}}
  ariaLabel="Planner areas"
/>`,
    },
  ],
});
