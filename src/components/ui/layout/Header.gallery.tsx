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

const headerRailToneExamples: ReadonlyArray<{
  tone: "subtle" | "loud";
  label: string;
  ariaLabel: string;
}> = [
  {
    tone: "subtle",
    label: "Subtle rail tone (default)",
    ariaLabel: "Header demo tabs (subtle tone)",
  },
  {
    tone: "loud",
    label: "Loud rail tone",
    ariaLabel: "Header demo tabs (loud tone)",
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
    <div className="grid gap-[var(--space-4)] lg:grid-cols-2">
      {headerRailToneExamples.map((example) => (
        <div
          key={example.tone}
          className="rounded-card border border-card-hairline/60 bg-panel/80 p-[var(--space-5)] shadow-[var(--shadow-outline-subtle)]"
        >
          <p className="mb-[var(--space-3)] text-label font-medium text-muted-foreground">
            {example.label}
          </p>
          <Header
            eyebrow="Workspace"
            heading="Header"
            subtitle="Segmented navigation anchored to the header"
            icon={
              <Circle
                aria-hidden="true"
                className="h-[var(--space-5)] w-[var(--space-5)] text-primary"
              />
            }
            railTone={example.tone}
            tabs={{
              items: headerTabs,
              value,
              onChange: setValue,
              ariaLabel: example.ariaLabel,
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
          <div className="mt-[var(--space-4)] grid gap-[var(--space-3)] sm:grid-cols-2">
            <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
              <p className="text-label text-muted-foreground">Next milestone</p>
              <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
                Launch sprint
              </p>
            </div>
            <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
              <p className="text-label text-muted-foreground">Team focus</p>
              <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
                Deep work block
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
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
        {
          id: "rail-tone",
          label: "Rail tone",
          type: "variant",
          values: [
            { value: "Subtle" },
            { value: "Loud" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:header:tabs",
        render: () => <HeaderGalleryPreview />,
      }),
      code: `<div className="grid gap-[var(--space-4)] lg:grid-cols-2">
  <div className="rounded-card border border-card-hairline/60 bg-panel/80 p-[var(--space-5)] shadow-[var(--shadow-outline-subtle)]">
    <p className="mb-[var(--space-3)] text-label text-muted-foreground">
      Subtle rail tone (default)
    </p>
    <Header
      eyebrow="Workspace"
      heading="Header"
      subtitle="Segmented navigation anchored to the header"
      railTone="subtle"
      icon={
        <Circle
          aria-hidden="true"
          className="h-[var(--space-5)] w-[var(--space-5)] text-primary"
        />
      }
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
        ariaLabel: "Header demo tabs (subtle tone)",
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
    </Header>
    <div className="mt-[var(--space-4)] grid gap-[var(--space-3)] sm:grid-cols-2">
      <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-label text-muted-foreground">Next milestone</p>
        <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
          Launch sprint
        </p>
      </div>
      <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-label text-muted-foreground">Team focus</p>
        <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
          Deep work block
        </p>
      </div>
    </div>
  </div>
  <div className="rounded-card border border-card-hairline/60 bg-panel/80 p-[var(--space-5)] shadow-[var(--shadow-outline-subtle)]">
    <p className="mb-[var(--space-3)] text-label text-muted-foreground">
      Loud rail tone
    </p>
    <Header
      eyebrow="Workspace"
      heading="Header"
      subtitle="Segmented navigation anchored to the header"
      railTone="loud"
      icon={
        <Circle
          aria-hidden="true"
          className="h-[var(--space-5)] w-[var(--space-5)] text-primary"
        />
      }
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
        ariaLabel: "Header demo tabs (loud tone)",
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
    </Header>
    <div className="mt-[var(--space-4)] grid gap-[var(--space-3)] sm:grid-cols-2">
      <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-label text-muted-foreground">Next milestone</p>
        <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
          Launch sprint
        </p>
      </div>
      <div className="rounded-card border border-card-hairline/60 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-label text-muted-foreground">Team focus</p>
        <p className="mt-[var(--space-1)] text-ui font-medium text-foreground">
          Deep work block
        </p>
      </div>
    </div>
  </div>
</div>`,
    },
  ],
});
