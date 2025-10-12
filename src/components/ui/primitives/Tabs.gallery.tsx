"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { Card } from "./Card";
import { TabList, TabPanel, type TabListItem, Tabs } from "./Tabs";

type ProjectTabKey = "overview" | "activity" | "files";
type StatusTabKey = "inbox" | "updates" | "archive" | "disabled" | "sync";

const focusVisibleClassName = "ring-2 ring-[var(--theme-ring)] ring-offset-0 outline-none";
const hoverClassName =
  "text-foreground bg-[--hover] shadow-[var(--tab-shadow-hover,var(--tab-shadow))]";

const projectTabs: TabListItem<ProjectTabKey>[] = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "Activity" },
  { key: "files", label: "Files" },
];

const statusTabs: TabListItem<StatusTabKey>[] = [
  { key: "inbox", label: "Inbox" },
  { key: "updates", label: "Updates", className: focusVisibleClassName },
  { key: "archive", label: "Archive" },
  { key: "disabled", label: "Disabled", disabled: true },
  { key: "sync", label: "Syncing", loading: true },
];

const statusLabels: Record<StatusTabKey, string> = {
  inbox: "Inbox",
  updates: "Updates",
  archive: "Archive",
  disabled: "Disabled",
  sync: "Syncing",
};

type PanelCardProps = {
  title: string;
  description: string;
};

type TabsStateSpec = {
  id: string;
  name: string;
  value: StatusTabKey;
  items: readonly TabListItem<StatusTabKey>[];
  code?: string;
};

const TABS_STATE_ITEMS: Record<
  "active" | "hover" | "focus-visible" | "disabled" | "loading",
  readonly TabListItem<StatusTabKey>[]
> = {
  active: [
    { key: "inbox", label: "Inbox" },
    { key: "updates", label: "Updates" },
  ],
  hover: [
    { key: "inbox", label: "Inbox" },
    { key: "updates", label: "Updates", className: hoverClassName },
  ],
  "focus-visible": [
    { key: "inbox", label: "Inbox" },
    { key: "updates", label: "Updates", className: focusVisibleClassName },
  ],
  disabled: [
    { key: "inbox", label: "Inbox" },
    { key: "disabled", label: "Disabled", disabled: true },
  ],
  loading: [
    { key: "inbox", label: "Inbox" },
    { key: "sync", label: "Syncing", loading: true },
  ],
};

const TABS_STATES: readonly TabsStateSpec[] = [
  {
    id: "active",
    name: "Active",
    value: "updates",
    items: TABS_STATE_ITEMS.active,
    code: `<Tabs value="updates" onValueChange={() => {}}>
  <TabList
    ariaLabel="Tab state preview"
    items={[
      { key: "inbox", label: "Inbox" },
      { key: "updates", label: "Updates" },
    ]}
    linkPanels={false}
    showBaseline
  />
</Tabs>`,
  },
  {
    id: "hover",
    name: "Hover",
    value: "inbox",
    items: TABS_STATE_ITEMS.hover,
    code: `<Tabs value="inbox" onValueChange={() => {}}>
  <TabList
    ariaLabel="Tab state preview"
    items={[
      { key: "inbox", label: "Inbox" },
      {
        key: "updates",
        label: "Updates",
        className: "${hoverClassName}",
      },
    ]}
    linkPanels={false}
    showBaseline
  />
</Tabs>`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    value: "inbox",
    items: TABS_STATE_ITEMS["focus-visible"],
    code: `<Tabs value="inbox" onValueChange={() => {}}>
  <TabList
    ariaLabel="Tab state preview"
    items={[
      { key: "inbox", label: "Inbox" },
      {
        key: "updates",
        label: "Updates",
        className: "${focusVisibleClassName}",
      },
    ]}
    linkPanels={false}
    showBaseline
  />
</Tabs>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    value: "inbox",
    items: TABS_STATE_ITEMS.disabled,
    code: `<Tabs value="inbox" onValueChange={() => {}}>
  <TabList
    ariaLabel="Tab state preview"
    items={[
      { key: "inbox", label: "Inbox" },
      { key: "disabled", label: "Disabled", disabled: true },
    ]}
    linkPanels={false}
    showBaseline
  />
</Tabs>`,
  },
  {
    id: "loading",
    name: "Loading",
    value: "inbox",
    items: TABS_STATE_ITEMS.loading,
    code: `<Tabs value="inbox" onValueChange={() => {}}>
  <TabList
    ariaLabel="Tab state preview"
    items={[
      { key: "inbox", label: "Inbox" },
      { key: "sync", label: "Syncing", loading: true },
    ]}
    linkPanels={false}
    showBaseline
  />
</Tabs>`,
  },
];

function PanelCard({ title, description }: PanelCardProps) {
  return (
    <Card className="space-y-[var(--space-2)]">
      <p className="text-title font-semibold tracking-[-0.01em]">{title}</p>
      <p className="text-ui text-muted-foreground">{description}</p>
    </Card>
  );
}

function TabsGalleryPreview() {
  const [statusTab, setStatusTab] = React.useState<StatusTabKey>("inbox");

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <Tabs defaultValue="overview">
        <div className="space-y-[var(--space-3)]">
          <TabList ariaLabel="Project sections" items={projectTabs} />
          <TabPanel value="overview">
            <PanelCard
              title="Overview"
              description="Keep a high-level summary of the plan visible for the team."
            />
          </TabPanel>
          <TabPanel value="activity">
            <PanelCard
              title="Activity"
              description="Show chronological activity without leaving the workspace."
            />
          </TabPanel>
          <TabPanel value="files">
            <PanelCard
              title="Files"
              description="Store briefs, shared assets, and notes alongside the plan."
            />
          </TabPanel>
        </div>
      </Tabs>

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <div className="space-y-[var(--space-3)]">
          <TabList
            ariaLabel="Notification filters"
            items={statusTabs}
            linkPanels={false}
            showBaseline
          />
          <Card className="text-ui text-muted-foreground">
            Active tab: <span className="font-medium text-foreground">{statusLabels[statusTab]}</span>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}

function TabsStatePreview({ state }: { state: TabsStateSpec }) {
  return (
    <Tabs value={state.value} onValueChange={() => {}}>
      <div className="space-y-[var(--space-3)]">
        <TabList
          ariaLabel="Tab state preview"
          items={[...state.items]}
          linkPanels={false}
          showBaseline
        />
      </div>
    </Tabs>
  );
}

export const TabsGallery = defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "tabs",
      name: "Tabs",
      description: "Context provider that links TabList controls with TabPanel content.",
      kind: "primitive",
      tags: ["tabs", "navigation"],
      axes: [
        {
          id: "layout",
          label: "Layout",
          type: "variant",
          values: [
            { value: "Panels" },
            { value: "Controlled list" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: TABS_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:tabs:wiring",
        render: () => <TabsGalleryPreview />,
      }),
      states: TABS_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:tabs:state:${state.id}`,
          render: () => <TabsStatePreview state={state} />,
        }),
      })),
      code: `<Tabs defaultValue="overview">
  <div className="space-y-[var(--space-3)]">
    <TabList
      items={[
        { key: "overview", label: "Overview" },
        { key: "activity", label: "Activity" },
        { key: "files", label: "Files" },
      ]}
      ariaLabel="Project sections"
    />
    <TabPanel value="overview">
      <Card className="space-y-[var(--space-2)]">
        <p className="text-title font-semibold tracking-[-0.01em]">Overview</p>
        <p className="text-ui text-muted-foreground">
          Keep a high-level summary of the plan visible for the team.
        </p>
      </Card>
    </TabPanel>
    <TabPanel value="activity">
      <Card className="space-y-[var(--space-2)]">
        <p className="text-title font-semibold tracking-[-0.01em]">Activity</p>
        <p className="text-ui text-muted-foreground">
          Show chronological activity without leaving the workspace.
        </p>
      </Card>
    </TabPanel>
    <TabPanel value="files">
      <Card className="space-y-[var(--space-2)]">
        <p className="text-title font-semibold tracking-[-0.01em]">Files</p>
        <p className="text-ui text-muted-foreground">
          Store briefs, shared assets, and notes alongside the plan.
        </p>
      </Card>
    </TabPanel>
  </div>
</Tabs>

<Tabs value="inbox" onValueChange={() => {}}>
  <div className="space-y-[var(--space-3)]">
    <TabList
      ariaLabel="Notification filters"
      items={[
        { key: "inbox", label: "Inbox" },
        {
          key: "updates",
          label: "Updates",
          className: "ring-2 ring-[var(--theme-ring)] ring-offset-0 outline-none",
        },
        { key: "archive", label: "Archive" },
        { key: "disabled", label: "Disabled", disabled: true },
        { key: "sync", label: "Syncing", loading: true },
      ]}
      linkPanels={false}
      showBaseline
    />
    <Card className="text-ui text-muted-foreground">
      Active tab: <span className="font-medium text-foreground">Inbox</span>
    </Card>
  </div>
</Tabs>`,
    },
  ],
})

export default TabsGallery
