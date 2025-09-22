import * as React from "react";
import { Circle, CircleCheck, CircleDot } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Header, { type HeaderTabsProps } from "./Header";

const headerTabs: HeaderTabsProps<string>["items"] = [
  {
    key: "summary",
    label: "Summary",
    icon: (
      <Circle
        aria-hidden="true"
        className="h-[var(--space-4)] w-[var(--space-4)]"
      />
    ),
  },
  {
    key: "timeline",
    label: "Timeline",
    icon: (
      <CircleDot
        aria-hidden="true"
        className="h-[var(--space-4)] w-[var(--space-4)]"
      />
    ),
  },
  {
    key: "insights",
    label: "Insights",
    icon: (
      <CircleCheck
        aria-hidden="true"
        className="h-[var(--space-4)] w-[var(--space-4)]"
      />
    ),
    disabled: true,
  },
];

function HeaderGalleryPreview() {
  const [value, setValue] = React.useState<string>(
    () => headerTabs.find((tab) => !tab.disabled)?.key ?? headerTabs[0]?.key ?? "",
  );
  const activeLabel = React.useMemo(
    () => headerTabs.find((tab) => tab.key === value)?.label ?? null,
    [value],
  );

  return (
    <Header
      heading="Header"
      subtitle="Segmented navigation anchored to the header"
      tabs={{
        items: headerTabs,
        value,
        onChange: setValue,
        ariaLabel: "Header demo tabs",
        size: "md",
      }}
      sticky={false}
      topClassName="top-0"
    >
      <p className="text-ui text-muted-foreground">
        Viewing
        <span className="ml-[var(--space-1)] font-medium text-foreground">
          {activeLabel}
        </span>
      </p>
    </Header>
  );
}

export default defineGallerySection({
  id: "layout",
  entries: [
    {
      id: "header",
      name: "Header",
      description: "Workspace header with sticky support and segmented tabs",
      kind: "component",
      tags: ["header", "navigation"],
      axes: [
        {
          id: "tab-state",
          label: "Tab state",
          type: "state",
          values: [
            { value: "Active" },
            { value: "Inactive" },
            { value: "Disabled" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:header:tabs",
        render: () => <HeaderGalleryPreview />,
      }),
      code: `<Header
  heading="Header"
  subtitle="Segmented navigation anchored to the header"
  tabs={{
    items: [
      {
        key: "summary",
        label: "Summary",
        icon: (
          <Circle
            aria-hidden="true"
            className="h-[var(--space-4)] w-[var(--space-4)]"
          />
        ),
      },
      {
        key: "timeline",
        label: "Timeline",
        icon: (
          <CircleDot
            aria-hidden="true"
            className="h-[var(--space-4)] w-[var(--space-4)]"
          />
        ),
      },
      {
        key: "insights",
        label: "Insights",
        icon: (
          <CircleCheck
            aria-hidden="true"
            className="h-[var(--space-4)] w-[var(--space-4)]"
          />
        ),
        disabled: true,
      },
    ],
    value: "summary",
    onChange: () => {},
    ariaLabel: "Header demo tabs",
    size: "md",
  }}
  sticky={false}
  topClassName="top-0"
>
  <p className="text-ui text-muted-foreground">
    Viewing
    <span className="ml-[var(--space-1)] font-medium text-foreground">
      Summary
    </span>
  </p>
</Header>`,
    },
  ],
});
