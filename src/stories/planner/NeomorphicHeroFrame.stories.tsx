import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  NeomorphicHeroFrame,
  TabBar,
  SearchBar,
  Button,
  ThemeToggle,
  type TabItem,
} from "@/components/ui";
import type {
  Align,
  HeroVariant,
  NeomorphicHeroFrameProps,
} from "@/components/ui/layout/NeomorphicHeroFrame";

const meta: Meta<typeof NeomorphicHeroFrame> = {
  title: "Planner/NeomorphicHeroFrame",
  component: NeomorphicHeroFrame,
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "compact", "dense"],
    },
    align: {
      control: "radio",
      options: ["start", "center", "end", "between"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof NeomorphicHeroFrame>;

type PlannerView = "overview" | "timeline" | "resources";

const plannerTabs: TabItem<PlannerView>[] = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "resources", label: "Resources", disabled: true },
];

const variantDescriptions: Record<
  Exclude<HeroVariant, "unstyled">,
  { title: string; description: string }
> = {
  default: {
    title: "Default neomorphic frame",
    description:
      "Applies the r-card-lg radius with spacious padding to spotlight hero content while the slots float above with soft shadows.",
  },
  compact: {
    title: "Compact layout",
    description:
      "Tightens the padding to the compact rhythm so filters and quick actions can live alongside dense dashboards.",
  },
  dense: {
    title: "Dense toolbar",
    description:
      "Uses the condensed spacing tokens to create a lean command surface ideal for secondary planners or table headers.",
  },
};

const alignCopy: Record<Align, string> = {
  start: "slots hug the leading edge",
  center: "slots align centrally",
  end: "slots hug the trailing edge",
  between: "slots distribute across the grid",
};

function HeroPreview({
  variant = "default",
  align = "start",
  label,
  ...rest
}: Partial<NeomorphicHeroFrameProps>) {
  const [activeView, setActiveView] = React.useState<PlannerView>("overview");
  const [searchValue, setSearchValue] = React.useState("");
  const variantKey: Exclude<HeroVariant, "unstyled"> =
    variant === "unstyled" ? "default" : variant;
  const copy = variantDescriptions[variantKey];
  const frameLabel = label ?? "Planner mission control";

  return (
    <NeomorphicHeroFrame
      {...rest}
      variant={variant}
      align={align}
      label={frameLabel}
      slots={{
        tabs: {
          node: (
            <TabBar<PlannerView>
              items={plannerTabs}
              value={activeView}
              onValueChange={(key) => setActiveView(key as PlannerView)}
              ariaLabel="Switch planner view"
              variant="neo"
              showBaseline
            />
          ),
          label: "Switch planner view",
        },
        search: {
          node: (
            <SearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Search workstreams…"
              aria-label="Search workstreams"
              loading={activeView === "resources"}
            />
          ),
          label: "Search workstreams",
        },
        actions: {
          node: (
            <div className="flex flex-wrap items-center gap-[var(--space-2)]">
              <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
              <Button size="sm" variant="secondary">
                Save view
              </Button>
              <Button size="sm" variant="primary" loading>
                Sync
              </Button>
              <Button size="sm" variant="ghost" disabled>
                Disabled
              </Button>
            </div>
          ),
          label: "Planner frame actions",
        },
      }}
    >
      <div className="grid gap-[var(--space-4)] md:grid-cols-2 md:gap-[var(--space-6)]">
        <div className="space-y-[var(--space-3)]">
          <h3 className="text-title font-semibold tracking-[-0.01em] text-foreground">
            {copy.title}
          </h3>
          <p className="text-ui text-muted-foreground">{copy.description}</p>
          <p className="text-ui text-muted-foreground">
            With align set to <span className="font-medium text-foreground">{align}</span>, {alignCopy[align]}
            so TabBar, SearchBar, and actions stay balanced at medium breakpoints.
          </p>
        </div>
        <dl className="grid gap-[var(--space-3)]">
          <div className="rounded-card r-card-md border border-border/30 bg-card/70 px-[var(--space-3)] py-[var(--space-3)]">
            <dt className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Tabs
            </dt>
            <dd className="text-ui text-foreground">
              Neo variant segments with baseline glow and keyboard focus rings.
            </dd>
          </div>
          <div className="rounded-card r-card-md border border-border/30 bg-card/70 px-[var(--space-3)] py-[var(--space-3)]">
            <dt className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Search
            </dt>
            <dd className="text-ui text-foreground">
              Respects loading, focus, and halo tokens via the SearchBar primitive.
            </dd>
          </div>
          <div className="rounded-card r-card-md border border-border/30 bg-card/70 px-[var(--space-3)] py-[var(--space-3)]">
            <dt className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Actions
            </dt>
            <dd className="text-ui text-foreground">
              Buttons and ThemeToggle showcase hover, pressed, loading, and disabled feedback.
            </dd>
          </div>
        </dl>
      </div>
    </NeomorphicHeroFrame>
  );
}

export const DefaultVariant: Story = {
  args: {
    variant: "default",
    align: "between",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const CompactVariant: Story = {
  args: {
    variant: "compact",
    align: "between",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const DenseVariant: Story = {
  args: {
    variant: "dense",
    align: "between",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const AlignStart: Story = {
  args: {
    variant: "default",
    align: "start",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const AlignCenter: Story = {
  args: {
    variant: "compact",
    align: "center",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const AlignEnd: Story = {
  args: {
    variant: "dense",
    align: "end",
  },
  render: (args) => <HeroPreview {...args} />,
};

export const AlignBetween: Story = {
  args: {
    variant: "default",
    align: "between",
  },
  render: (args) => <HeroPreview {...args} />,
};
