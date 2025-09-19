import * as React from "react";
import { Circle, CircleCheck, CircleDot } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery";

import HeaderTabs, { type HeaderTabItem } from "./HeaderTabs";

type ItemKey = "plan" | "review" | "archive";

const ITEMS: HeaderTabItem<ItemKey>[] = [
  { key: "plan", label: "Plan", icon: <Circle aria-hidden="true" /> },
  { key: "review", label: "Review", icon: <CircleDot aria-hidden="true" /> },
  {
    key: "archive",
    label: "Archive",
    icon: <CircleCheck aria-hidden="true" />,
    disabled: true,
  },
];

function HeaderTabsGalleryPreview() {
  const [value, setValue] = React.useState<ItemKey>(
    () => ITEMS.find((item) => !item.disabled)?.key ?? "plan",
  );

  return (
    <HeaderTabs
      items={ITEMS}
      value={value}
      onChange={setValue}
      ariaLabel="Header tab demo"
      idBase="header-tabs-gallery"
    />
  );
}

export default defineGallerySection({
  id: "layout",
  entries: [
    {
      id: "header-tabs",
      name: "HeaderTabs",
      description: "Neomorphic segmented control used within headers",
      kind: "component",
      tags: ["tabs", "navigation"],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: [
            { value: "Active" },
            { value: "Inactive" },
            { value: "Disabled" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:header-tabs:control",
        render: () => <HeaderTabsGalleryPreview />,
      }),
      code: `<HeaderTabs
  items={[
    { key: "plan", label: "Plan", icon: <Circle aria-hidden="true" /> },
    { key: "review", label: "Review", icon: <CircleDot aria-hidden="true" /> },
    {
      key: "archive",
      label: "Archive",
      icon: <CircleCheck aria-hidden="true" />,
      disabled: true,
    },
  ]}
  value="plan"
  onChange={() => {}}
  ariaLabel="Header tab demo"
/>`,
    },
  ],
});
