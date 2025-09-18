import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Header,
  ThemeToggle,
  type HeaderTab,
  type HeaderTabsProps,
} from "@/components/ui";
import ThemeProvider from "@/lib/theme-context";
import {
  BarChart3,
  CalendarDays,
  ShieldCheck,
  Users,
} from "lucide-react";

const meta: Meta<typeof Header> = {
  title: "Navigation/Header Tabs",
  component: Header,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`Header` surfaces segmented navigation through its `tabs` prop. Each example pairs the control with realistic content so designers and engineers can review behavior across sizes, icons, disabled states, and keyboard support.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="bg-background text-foreground">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-6)]">
            <div className="flex justify-end">
              <ThemeToggle ariaLabel="Toggle theme" />
            </div>
            <Story />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Header>;

type HeaderTabsSize = NonNullable<HeaderTabsProps<string>["size"]>;
type HeaderTabsAlign = NonNullable<HeaderTabsProps<string>["align"]>;

type HeaderTabsExampleProps<K extends string> = {
  heading: string;
  subtitle?: string;
  items: HeaderTab<K>[];
  ariaLabel: string;
  size?: HeaderTabsSize;
  align?: HeaderTabsAlign;
  compact?: boolean;
};

function HeaderTabsExample<K extends string>({
  heading,
  subtitle,
  items,
  ariaLabel,
  size = "sm",
  align = "end",
  compact = false,
}: HeaderTabsExampleProps<K>) {
  const firstEnabledKey = React.useMemo(
    () =>
      (items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? "") as K,
    [items],
  );
  const [active, setActive] = React.useState<K>(firstEnabledKey);

  React.useEffect(() => {
    if (!items.some((item) => item.key === active && !item.disabled)) {
      setActive(firstEnabledKey);
    }
  }, [active, firstEnabledKey, items]);

  const activeLabel = React.useMemo(
    () => items.find((item) => item.key === active)?.label ?? null,
    [active, items],
  );

  return (
    <Header
      heading={heading}
      subtitle={subtitle}
      sticky={false}
      topClassName="top-0"
      compact={compact}
      tabs={{
        items,
        value: active,
        onChange: setActive,
        ariaLabel,
        size,
        align,
      }}
    >
      <div className="text-ui text-muted-foreground">
        Viewing
        <span className="ml-[var(--space-1)] font-medium text-foreground">
          {activeLabel}
        </span>
      </div>
    </Header>
  );
}

type PlannerTabKey = "overview" | "timeline" | "insights" | "history";

const TEXT_TABS: HeaderTab<PlannerTabKey>[] = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "insights", label: "Insights" },
  { key: "history", label: "History" },
];

const DISABLED_TABS: HeaderTab<PlannerTabKey>[] = TEXT_TABS.map((item) =>
  item.key === "insights" ? { ...item, disabled: true } : item,
);

type IconTabKey = "schedule" | "performance" | "roster" | "security";

const ICON_CLASS = "h-[var(--space-4)] w-[var(--space-4)]";

const ICON_TABS: HeaderTab<IconTabKey>[] = [
  {
    key: "schedule",
    label: "Schedule",
    icon: <CalendarDays aria-hidden="true" className={ICON_CLASS} />,
  },
  {
    key: "performance",
    label: "Performance",
    icon: <BarChart3 aria-hidden="true" className={ICON_CLASS} />,
  },
  {
    key: "roster",
    label: "Roster",
    icon: <Users aria-hidden="true" className={ICON_CLASS} />,
  },
  {
    key: "security",
    label: "Security",
    icon: <ShieldCheck aria-hidden="true" className={ICON_CLASS} />,
  },
];

export const TextOnly: Story = {
  name: "Without icons",
  render: () => (
    <HeaderTabsExample
      heading="Planning overview"
      subtitle="Segmented tabs with labels only"
      items={TEXT_TABS}
      ariaLabel="Planning sections"
      size="sm"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Baseline configuration with copy-only tabs. The segmented control defaults to the compact `sm` height so it nests cleanly inside dense headers.",
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <HeaderTabsExample
      heading="Scouting dashboard"
      subtitle="Icons reinforce context without replacing text"
      items={ICON_TABS}
      ariaLabel="Scouting sections"
      size="md"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Icons sit before the label and remain purely decorative. Assistive technology announces the text label while the icon stays hidden via `aria-hidden`.",
      },
    },
  },
};

export const SizeVariants: Story = {
  name: "Sizes sm / md / lg",
  render: () => (
    <div className="flex flex-col gap-[var(--space-4)]">
      <HeaderTabsExample
        heading="Compact"
        subtitle="Small tabs for dense dashboards"
        items={TEXT_TABS}
        ariaLabel="Compact navigation"
        size="sm"
        compact
      />
      <HeaderTabsExample
        heading="Default"
        subtitle="Medium tabs suit most headers"
        items={TEXT_TABS}
        ariaLabel="Default navigation"
        size="md"
      />
      <HeaderTabsExample
        heading="Spacious"
        subtitle="Large tabs pair well with iconography"
        items={ICON_TABS}
        ariaLabel="Large navigation"
        size="lg"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`Header` forwards the `size` option to the underlying `TabBar`, supporting compact (`sm`), standard (`md`), and spacious (`lg`) heights while preserving spacing tokens.",
      },
    },
  },
};

export const WithDisabledTab: Story = {
  name: "Disabled example",
  render: () => (
    <HeaderTabsExample
      heading="Team insights"
      subtitle="Unavailable tabs stay focusable but inert"
      items={DISABLED_TABS}
      ariaLabel="Team insights sections"
      size="md"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Disabled tabs remain in the sequence so users understand upcoming sections. Keyboard navigation skips them, and pointer interactions show the disabled cursor state.",
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  name: "Keyboard interaction",
  render: () => (
    <HeaderTabsExample
      heading="Keyboard demo"
      subtitle="Arrow keys, Home, and End move focus"
      items={DISABLED_TABS}
      ariaLabel="Keyboard navigation demo"
      size="md"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Select a tab then use ←/→ to move between sections. `Home` jumps to the first enabled tab and `End` jumps to the last, skipping any disabled items along the way.",
      },
    },
  },
  play: async (context) => {
    const canvasElement = (
      context as { canvasElement?: HTMLElement }
    ).canvasElement;
    if (!canvasElement) {
      return;
    }

    const tablist = canvasElement.querySelector<HTMLElement>(
      '[role="tablist"][aria-label="Keyboard navigation demo"]',
    );
    if (!tablist) {
      throw new Error("Keyboard navigation demo tablist not found");
    }

    const findTab = (label: string) =>
      Array.from(tablist.querySelectorAll<HTMLElement>("[role=\"tab\"]")).find(
        (tab) => tab.textContent?.trim().startsWith(label),
      );

    const overview = findTab("Overview");
    if (!overview) {
      throw new Error("Overview tab not found");
    }

    const waitForFrame = () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 16);
      });

    overview.focus();
    overview.click();
    overview.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await waitForFrame();

    const timeline = findTab("Timeline");
    if (!timeline || timeline.getAttribute("aria-selected") !== "true") {
      throw new Error("ArrowRight should select the Timeline tab");
    }

    timeline.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    await waitForFrame();

    const history = findTab("History");
    if (!history || history.getAttribute("aria-selected") !== "true") {
      throw new Error("End should select the History tab");
    }

    history.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    await waitForFrame();

    if (overview.getAttribute("aria-selected") !== "true") {
      throw new Error("Home should return focus to the first tab");
    }
  },
};
