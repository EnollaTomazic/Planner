import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  Textarea,
  SegmentedButton,
  Card,
  NeoCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Sheet,
  Modal,
  Toast,
  ThemePicker,
  BackgroundPicker,
  Progress,
  Split,
  TabBar,
  TitleBar,
  AnimationToggle,
  CatCompanion,
  ThemeToggle,
  CheckCircle,
  SideSelector,
  PillarBadge,
  PillarSelector,
  Header,
  Hero,
  NeomorphicHeroFrame,
  PageShell,
  SectionCard as UiSectionCard,
  FieldShell,
  SearchBar,
  Label,
  type HeaderTab,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import GoalListDemo from "./GoalListDemo";
import PromptList from "./PromptList";
import SelectShowcase from "./SelectShowcase";
import SpinnerShowcase from "./SpinnerShowcase";
import SnackbarShowcase from "./SnackbarShowcase";
import SkeletonShowcase from "./SkeletonShowcase";
import ToggleShowcase from "./ToggleShowcase";
import PageHeaderDemo from "./PageHeaderDemo";
import NeomorphicHeroFrameDemo from "./NeomorphicHeroFrameDemo";
import {
  DashboardCard,
  DashboardList,
  BottomNav,
  IsometricRoom,
  QuickActionGrid,
  HeroPortraitFrame,
  WelcomeHeroFigure,
} from "@/components/home";
import ChampListEditor from "@/components/team/ChampListEditor";
import {
  RoleSelector,
  ReviewListItem,
  LaneOpponentForm,
  ResultScoreSection,
  PillarsSelector as ReviewsPillarsSelector,
  TimestampMarkers,
  ReviewSurface,
  ReviewSliderTrack,
  ScoreMeter,
} from "@/components/reviews";
import type { PromptWithTitle } from "./usePrompts";
import type { Review, Role } from "@/lib/types";
import { COLOR_PALETTES, defaultTheme } from "@/lib/theme";
import {
  GoalsProgress,
  RemindersTab,
  TimerRing,
  TimerTab,
} from "@/components/goals";
import { ProgressRingIcon, TimerRingIcon } from "@/icons";
import { Circle, CircleDot, CircleCheck, Plus } from "lucide-react";

export type CompsView = "components" | "colors";
export type Section =
  | "buttons"
  | "inputs"
  | "prompts"
  | "planner"
  | "cards"
  | "page-header"
  | "layout"
  | "feedback"
  | "toggles"
  | "league"
  | "misc";

export type Spec = {
  id: string;
  name: string;
  description?: string;
  element: React.ReactNode;
  tags: string[];
  props?: { label: string; value: string }[];
  code: string;
};

export const COMPS_VIEW_TABS: HeaderTab<CompsView>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
];

export const COLOR_SECTIONS = [
  { title: "Aurora", tokens: COLOR_PALETTES.aurora },
  { title: "Neutrals", tokens: COLOR_PALETTES.neutrals },
  { title: "Accents", tokens: COLOR_PALETTES.accents },
];

export const demoPrompts: PromptWithTitle[] = [
  {
    id: "p1",
    title: "Demo prompt",
    text: "",
    createdAt: Date.now(),
  },
];

export const demoReview: Review = {
  id: "r1",
  title: "Sample Review",
  notes: "Quick note",
  tags: [],
  pillars: [],
  createdAt: Date.now(),
  matchup: "Lux vs Ahri",
  role: "MID",
  score: 8,
  result: "Win",
};

function RoleSelectorDemo() {
  const [role, setRole] = React.useState<Role>("MID");
  return <RoleSelector value={role} onChange={setRole} />;
}
function ThemePickerDemo() {
  const [t, setT] = React.useState(defaultTheme());
  return (
    <ThemePicker
      variant={t.variant}
      onVariantChange={(v) => setT((prev) => ({ ...prev, variant: v }))}
    />
  );
}

function BackgroundPickerDemo() {
  const [t, setT] = React.useState(defaultTheme());
  return (
    <BackgroundPicker
      bg={t.bg}
      onBgChange={(b) => setT((prev) => ({ ...prev, bg: b }))}
    />
  );
}

function ReviewSurfaceDemo() {
  return (
    <ReviewSurface padding="md" tone="muted">
      <div className="text-ui text-foreground/70">Surface content</div>
    </ReviewSurface>
  );
}

function ReviewSliderTrackDemo() {
  return (
    <ReviewSurface padding="inline" className="relative h-12">
      <ReviewSliderTrack value={7} tone="score" variant="input" />
    </ReviewSurface>
  );
}

function ScoreMeterDemo() {
  return <ScoreMeter label="Score" value={8} detail={<span>Great positioning</span>} />;
}

function ChampListEditorDemo() {
  const [editing, setEditing] = React.useState(true);
  const [list, setList] = React.useState<string[]>(["Ashe", "Lulu"]);

  return (
    <div className="space-y-3" data-scope="team">
      <div className="flex items-center justify-between">
        <span className="text-label font-semibold tracking-[0.02em] text-muted-foreground">
          Champions
        </span>
        <Button size="sm" onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
      <ChampListEditor
        list={list}
        onChange={setList}
        editing={editing}
        emptyLabel="-"
        viewClassName="champ-badges mt-1 flex flex-wrap gap-2"
      />
    </div>
  );
}

function HeaderTabsDemo() {
  const [tab, setTab] = React.useState("one");
  const tabs: HeaderTab<string>[] = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
  ];
  return (
    <Header
      heading="Header"
      tabs={{
        items: tabs,
        value: tab,
        onChange: setTab,
        ariaLabel: "Header demo tabs",
      }}
      sticky={false}
      topClassName="top-0"
    />
  );
}

function CardDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-ui">Body</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  );
}

function NeoCardDemo() {
  return (
    <NeoCard
      className="p-4"
      overlay={
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[var(--accent-overlay)] mix-blend-overlay opacity-20" />
      }
    >
      <p className="text-ui">Body</p>
    </NeoCard>
  );
}

function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <Card>
          <CardHeader>
            <CardTitle>Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ui">Content</p>
          </CardContent>
        </Card>
      </Sheet>
    </>
  );
}

function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ui">Content</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    </>
  );
}

function ToastDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Show
      </Button>
      <Toast open={open} onOpenChange={setOpen} closable showProgress>
        <p className="text-ui">Toast message</p>
      </Toast>
    </>
  );
}
export const SPEC_DATA: Record<Section, Spec[]> = {
  buttons: [
    {
      id: "button",
      name: "Button",
      description: "Primary and ghost buttons",
      element: (
        <div className="flex gap-4">
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      ),
      tags: ["button", "action"],
      props: [{ label: "sizes", value: "sm md lg" }],
      code: `<div className="flex gap-4">
  <Button>Primary</Button>
  <Button variant="ghost">Ghost</Button>
</div>`,
    },
    {
      id: "button-states",
      name: "Button States",
      description: "State tokens",
      element: (
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button className="bg-[--hover]">Hover</Button>
          <Button className="ring-2 ring-[var(--focus)]">Focus</Button>
          <Button className="bg-[--active]">Active</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      ),
      tags: ["button", "states"],
      code: `<div className="flex flex-wrap gap-4">
  <Button>Default</Button>
  <Button className="bg-[--hover]">Hover</Button>
  <Button className="ring-2 ring-[var(--focus)]">Focus</Button>
  <Button className="bg-[--active]">Active</Button>
  <Button disabled>Disabled</Button>
  <Button loading>Loading</Button>
</div>`,
    },
    {
      id: "segmented-button",
      name: "SegmentedButton",
      description: "Segmented control button",
      element: (
        <div className="flex gap-4">
          <SegmentedButton>Default</SegmentedButton>
          <SegmentedButton isActive>Active</SegmentedButton>
        </div>
      ),
      tags: ["button", "segmented"],
      code: `<div className="flex gap-4">
  <SegmentedButton>Default</SegmentedButton>
  <SegmentedButton isActive>Active</SegmentedButton>
</div>`,
    },
    {
      id: "tab-bar-filters",
      name: "TabBar (filters)",
      description: "Preset filter tabs with icons",
      element: (
        <TabBar
          items={[
            { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
            {
              key: "active",
              label: "Active",
              icon: <CircleDot aria-hidden="true" />,
            },
            {
              key: "done",
              label: "Done",
              icon: <CircleCheck aria-hidden="true" />,
            },
          ]}
          defaultValue="active"
          ariaLabel="Show active goals"
        />
      ),
      tags: ["button", "segmented"],
      code: `<TabBar
  items={[
    { key: "all", label: "All", icon: <Circle aria-hidden="true" /> },
    {
      key: "active",
      label: "Active",
      icon: <CircleDot aria-hidden="true" />,
    },
    {
      key: "done",
      label: "Done",
      icon: <CircleCheck aria-hidden="true" />,
    },
  ]}
  defaultValue="active"
  ariaLabel="Show active goals"
/>`,
    },
    {
      id: "quick-action-grid",
      name: "QuickActionGrid",
      description: "Maps quick action configs to styled buttons",
      element: (
        <QuickActionGrid
          actions={[
            { href: "/planner", label: "Planner Today" },
            { href: "/goals", label: "New Goal", tone: "accent" },
            { href: "/reviews", label: "New Review", tone: "accent" },
          ]}
          className="md:flex-row md:items-center md:justify-between"
          buttonClassName="motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
        />
      ),
      tags: ["button", "layout"],
      code: `<QuickActionGrid
  actions={[
    { href: "/planner", label: "Planner Today" },
    { href: "/goals", label: "New Goal", tone: "accent" },
    { href: "/reviews", label: "New Review", tone: "accent" },
  ]}
  className="md:flex-row md:items-center md:justify-between"
  buttonClassName="motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
/>`,
    },
    {
      id: "icon-button",
      name: "IconButton",
      description: "Size variants (neon proportions)",
      element: (
        <div className="flex items-center gap-4">
          <IconButton size="xs" aria-label="Add">
            <Plus />
          </IconButton>
          <IconButton size="sm" aria-label="Add">
            <Plus />
          </IconButton>
          <IconButton size="md" aria-label="Add">
            <Plus />
          </IconButton>
        </div>
      ),
      tags: ["icon", "button"],
      props: [{ label: "sizes", value: "xs sm md" }],
      code: `<div className="flex items-center gap-4">
  <IconButton size="xs" aria-label="Add">
    <Plus />
  </IconButton>
  <IconButton size="sm" aria-label="Add">
    <Plus />
  </IconButton>
  <IconButton size="md" aria-label="Add">
    <Plus />
  </IconButton>
</div>`,
    },
    {
      id: "icon-button-states",
      name: "IconButton States",
      description: "State tokens",
      element: (
        <div className="flex flex-wrap gap-4">
          <IconButton aria-label="Default">
            <Plus />
          </IconButton>
          <IconButton className="bg-[--hover]" aria-label="Hover">
            <Plus />
          </IconButton>
          <IconButton className="ring-2 ring-[var(--focus)]" aria-label="Focus">
            <Plus />
          </IconButton>
          <IconButton className="bg-[--active]" aria-label="Active">
            <Plus />
          </IconButton>
          <IconButton disabled aria-label="Disabled">
            <Plus />
          </IconButton>
          <IconButton loading aria-label="Loading">
            <Plus />
          </IconButton>
        </div>
      ),
      tags: ["icon", "button", "states"],
      code: `<div className="flex flex-wrap gap-4">
  <IconButton aria-label="Default">
    <Plus />
  </IconButton>
  <IconButton className="bg-[--hover]" aria-label="Hover">
    <Plus />
  </IconButton>
  <IconButton className="ring-2 ring-[var(--focus)]" aria-label="Focus">
    <Plus />
  </IconButton>
  <IconButton className="bg-[--active]" aria-label="Active">
    <Plus />
  </IconButton>
  <IconButton disabled aria-label="Disabled">
    <Plus />
  </IconButton>
  <IconButton loading aria-label="Loading">
    <Plus />
  </IconButton>
</div>`,
    },
  ],
  inputs: [
    {
      id: "input",
      name: "Input",
      description: "Standard text input",
      element: <Input placeholder="Type here" />,
      tags: ["input", "text"],
      code: `<Input placeholder="Type here" />`,
    },
    {
      id: "input-states",
      name: "Input States",
      description: "State tokens",
      element: (
        <div className="flex flex-col gap-2">
          <Input placeholder="Default" />
          <Input placeholder="Hover" className="bg-[--hover]" />
          <Input placeholder="Focus" className="ring-2 ring-[var(--focus)]" />
          <Input placeholder="Active" className="bg-[--active]" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Loading" data-loading="true" />
        </div>
      ),
      tags: ["input", "states"],
      code: `<div className="flex flex-col gap-2">
  <Input placeholder="Default" />
  <Input placeholder="Hover" className="bg-[--hover]" />
  <Input placeholder="Focus" className="ring-2 ring-[var(--focus)]" />
  <Input placeholder="Active" className="bg-[--active]" />
  <Input placeholder="Disabled" disabled />
  <Input placeholder="Loading" data-loading="true" />
</div>`,
    },
    {
      id: "select",
      name: "Select",
      description: "Animated and native select",
      element: <SelectShowcase />,
      tags: ["select", "input"],
      code: `const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];
<>
  <AnimatedSelect items={items} placeholder="Animated" />
  <NativeSelect items={items} />
  <Select items={items} disabled placeholder="Disabled" />
</>`,
    },
    {
      id: "textarea",
      name: "Textarea",
      description: "Multi-line text input",
      element: (
        <div className="flex flex-col gap-2">
          <Textarea placeholder="Type here" />
          <Textarea placeholder="Disabled" disabled />
        </div>
      ),
      tags: ["textarea", "input"],
      code: `<div className="flex flex-col gap-2">
  <Textarea placeholder="Type here" />
  <Textarea placeholder="Disabled" disabled />
</div>`,
    },
    {
      id: "field-shell",
      name: "FieldShell",
      description: "Frame for custom field content",
      element: (
        <FieldShell className="w-56">
          <div className="px-4 py-2 text-ui text-muted-foreground">
            Custom content
          </div>
        </FieldShell>
      ),
      tags: ["field", "shell"],
      code: `<FieldShell className="w-56">
  <div className="px-4 py-2 text-ui text-muted-foreground">
    Custom content
  </div>
</FieldShell>`,
    },
    {
      id: "label",
      name: "Label",
      element: (
        <div className="flex w-56 flex-col gap-2">
          <Label htmlFor="label-demo">Label</Label>
          <Input id="label-demo" placeholder="With label" />
        </div>
      ),
      tags: ["label", "input"],
      code: `<div className="flex w-56 flex-col gap-2">
  <Label htmlFor="label-demo">Label</Label>
  <Input id="label-demo" placeholder="With label" />
</div>`,
    },
    {
      id: "search-bar",
      name: "SearchBar",
      description: "Debounced search input",
      element: (
        <SearchBar
          value=""
          placeholder="Search components"
          className="w-56"
        />
      ),
      tags: ["search", "input"],
      code: `<SearchBar
  value=""
  placeholder="Search components"
  className="w-56"
/>`,
    },
  ],
  prompts: [
    {
      id: "prompt-list",
      name: "PromptList",
      description: "Prompt filtering",
      element: <PromptList prompts={demoPrompts} query="" />,
      tags: ["prompt", "list"],
      code: `<PromptList prompts={demoPrompts} query="" />`,
    },
    {
      id: "goal-list-demo",
      name: "GoalListDemo",
      element: <GoalListDemo />,
      tags: ["goal", "list"],
      code: `<GoalListDemo />`,
    },
  ],
  planner: [
    {
      id: "bottom-nav",
      name: "BottomNav",
      element: <BottomNav />,
      tags: ["nav", "bottom"],
      code: `<BottomNav />`,
    },
    {
      id: "isometric-room",
      name: "IsometricRoom",
      element: <IsometricRoom variant="aurora" />,
      tags: ["room", "3d"],
      code: `<IsometricRoom variant="aurora" />`,
    },
    {
      id: "goals-progress",
      name: "GoalsProgress",
      element: <GoalsProgress total={3} pct={50} />,
      tags: ["goals", "progress"],
      code: `<GoalsProgress total={3} pct={50} />`,
    },
    {
      id: "reminders-tab",
      name: "RemindersTab",
      element: <RemindersTab />,
      tags: ["reminders", "tab"],
      code: `<RemindersTab />`,
    },
    {
      id: "timer-ring",
      name: "TimerRing",
      element: <TimerRing pct={42} />,
      tags: ["timer", "ring"],
      code: `<TimerRing pct={42} />`,
    },
    {
      id: "timer-tab",
      name: "TimerTab",
      element: <TimerTab />,
      tags: ["timer", "tab"],
      code: `<TimerTab />`,
    },
    {
      id: "progress-ring-icon",
      name: "ProgressRingIcon",
      element: <ProgressRingIcon pct={50} />,
      tags: ["icon", "progress"],
      code: `<ProgressRingIcon pct={50} />`,
    },
    {
      id: "timer-ring-icon",
      name: "TimerRingIcon",
      element: <TimerRingIcon pct={75} />,
      tags: ["icon", "timer"],
      code: `<TimerRingIcon pct={75} />`,
    },
  ],
  cards: [
    {
      id: "dashboard-card",
      name: "DashboardCard",
      element: <DashboardCard title="Demo" />,
      tags: ["dashboard", "card"],
      code: `<DashboardCard title="Demo" />`,
    },
    {
      id: "dashboard-list",
      name: "DashboardList",
      element: (
        <DashboardList
          items={[
            { id: "sync", title: "Strategy sync", meta: "Today" },
            { id: "retro", title: "Retro prep", meta: "Wed" },
          ]}
          getKey={(item) => item.id}
          itemClassName="flex justify-between text-ui"
          empty="No highlights"
          renderItem={(item) => (
            <>
              <span>{item.title}</span>
              <span className="text-label text-muted-foreground">{item.meta}</span>
            </>
          )}
        />
      ),
      tags: ["dashboard", "list"],
      code: `<DashboardList
  items={[
    { id: "sync", title: "Strategy sync", meta: "Today" },
    { id: "retro", title: "Retro prep", meta: "Wed" },
  ]}
  getKey={(item) => item.id}
  itemClassName="flex justify-between text-ui"
  empty="No highlights"
  renderItem={(item) => (
    <>
      <span>{item.title}</span>
      <span className="text-label text-muted-foreground">{item.meta}</span>
    </>
  )}
/>`,
    },
    {
      id: "card-demo",
      name: "Card",
      element: <CardDemo />,
      tags: ["card", "layout"],
      code: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-ui">Body</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`,
    },
    {
      id: "neo-card-demo",
      name: "NeoCard",
      element: <NeoCardDemo />,
      tags: ["card", "overlay", "layout"],
      code: `<NeoCard
  className="p-4"
  overlay={<div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[var(--accent-overlay)] mix-blend-overlay opacity-20" />}
>
  <p className="text-ui">Body</p>
</NeoCard>`,
    },
    {
      id: "review-surface",
      name: "ReviewSurface",
      element: (
        <div className="w-56">
          <ReviewSurfaceDemo />
        </div>
      ),
      tags: ["review", "surface"],
      code: `<ReviewSurface padding="md" tone="muted">
  <div className="text-ui text-foreground/70">Surface content</div>
</ReviewSurface>`,
    },
    {
      id: "review-slider-track",
      name: "ReviewSliderTrack",
      element: (
        <div className="w-56">
          <ReviewSliderTrackDemo />
        </div>
      ),
      tags: ["review", "slider"],
      code: `<ReviewSurface padding="inline" className="relative h-12">
  <ReviewSliderTrack value={7} tone="score" variant="input" />
</ReviewSurface>`,
    },
    {
      id: "score-meter",
      name: "ScoreMeter",
      element: (
        <div className="w-56">
          <ScoreMeterDemo />
        </div>
      ),
      tags: ["review", "slider", "summary"],
      code: `<ScoreMeter
  label="Score"
  value={8}
  detail={<span>Great positioning</span>}
/>`,
    },
    {
      id: "section-card-variants",
      name: "SectionCard Variants",
      element: (
        <div className="flex flex-col gap-4">
          <UiSectionCard>
            <UiSectionCard.Header title="Neo (default)" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
          <UiSectionCard variant="plain">
            <UiSectionCard.Header title="Plain" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
        </div>
      ),
      tags: ["section", "card"],
      code: `<div className="flex flex-col gap-4">
  <SectionCard>
    <SectionCard.Header title="Neo (default)" />
    <SectionCard.Body>Content</SectionCard.Body>
  </SectionCard>
  <SectionCard variant="plain">
    <SectionCard.Header title="Plain" />
    <SectionCard.Body>Content</SectionCard.Body>
  </SectionCard>
</div>`,
    },
  ],
  layout: [
    {
      id: "header-tabs",
      name: "Header Tabs",
      description: "Header with segmented tabs",
      element: <HeaderTabsDemo />,
      tags: ["header", "tabs"],
      code: `<Header
  heading="Header"
  tabs={{
    items: [{ key: "one", label: "One" }, { key: "two", label: "Two" }],
    value: "one",
    onChange: () => {},
    ariaLabel: "Header demo tabs",
  }}
  sticky={false}
  topClassName="top-0"
/>`,
    },
    {
      id: "page-shell",
      name: "PageShell",
      description: "Responsive page container",
      element: (
        <PageShell className="space-y-3 py-6">
          <div className="text-label font-semibold tracking-[0.02em] text-muted-foreground">
            Page shell content
          </div>
          <Button size="sm">Action</Button>
        </PageShell>
      ),
      tags: ["layout", "shell"],
      code: `<PageShell className="space-y-3 py-6">
  <div className="text-label font-semibold tracking-[0.02em] text-muted-foreground">
    Page shell content
  </div>
  <Button size="sm">Action</Button>
</PageShell>`,
    },
    {
      id: "sheet-demo",
      name: "Sheet",
      element: <SheetDemo />,
      tags: ["sheet", "overlay"],
      code: `<Button size="sm">Open</Button>
<Sheet open>
  <Card>
    <CardHeader>
      <CardTitle>Sheet</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-ui">Content</p>
    </CardContent>
  </Card>
</Sheet>`,
    },
    {
      id: "modal-demo",
      name: "Modal",
      element: <ModalDemo />,
      tags: ["modal", "overlay"],
      code: `<Button size="sm">Open</Button>
<Modal open>
  <Card>
    <CardHeader>
      <CardTitle>Modal</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-ui">Content</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Close</Button>
    </CardFooter>
  </Card>
</Modal>`,
    },
    {
      id: "toast-demo",
      name: "Toast",
      element: <ToastDemo />,
      tags: ["toast", "feedback"],
      code: `<Button size="sm">Show</Button>
<Toast open closable showProgress><p className="text-ui">Toast message</p></Toast>`,
    },
    {
      id: "split",
      name: "Split",
      element: (
        <Split
          left={<div className="p-4">Left</div>}
          right={<div className="p-4">Right</div>}
        />
      ),
      tags: ["split", "layout"],
      code: `<Split left={<div>Left</div>} right={<div>Right</div>} />`,
    },
    {
      id: "tab-bar",
      name: "TabBar",
      element: (
        <TabBar
          items={[
            { key: "a", label: "A" },
            { key: "b", label: "B" },
          ]}
          defaultValue="a"
          ariaLabel="Example tabs"
        />
      ),
      tags: ["tabs"],
      code: `<TabBar
  items={[{ key: "a", label: "A" }, { key: "b", label: "B" }]}
  defaultValue="a"
  ariaLabel="Example tabs"
/>`,
    },
    {
      id: "tab-bar-app-nav",
      name: "TabBar (app nav)",
      description: "Controlled TabBar for section switching",
      element: (
        <TabBar
          items={[
            { key: "reviews", label: "Reviews" },
            { key: "planner", label: "Planner" },
            { key: "goals", label: "Goals" },
          ]}
          defaultValue="reviews"
          ariaLabel="Planner areas"
        />
      ),
      tags: ["tabs"],
      code: `<TabBar
  items={[
    { key: "reviews", label: "Reviews" },
    { key: "planner", label: "Planner" },
    { key: "goals", label: "Goals" },
  ]}
  defaultValue="reviews"
  ariaLabel="Planner areas"
/>`,
    },
    {
      id: "title-bar",
      name: "TitleBar",
      element: <TitleBar label="Title" />,
      tags: ["title", "bar"],
      code: `<TitleBar label="Title" />`,
    },
  ],
  "page-header": [
    {
      id: "neomorphic-hero-frame",
      name: "NeomorphicHeroFrame",
      description:
        "Composable neomorphic frame with semantic wrappers, tokenized spacing, and an action row for tabs, search, and buttons.",
      element: <NeomorphicHeroFrameDemo />,
      tags: ["hero", "layout", "tokens"],
      code: `<NeomorphicHeroFrame
  as="header"
  variant="default"
  actionArea={{
    tabs: (
      <TabBar
        items={[
          { key: "missions", label: "Missions" },
          { key: "briefings", label: "Briefings" },
          { key: "archive", label: "Archive", disabled: true },
        ]}
        value="missions"
        onValueChange={() => {}}
        ariaLabel="Switch mission focus"
        showBaseline
      />
    ),
    search: (
      <SearchBar
        value=""
        onValueChange={() => {}}
        placeholder="Search mission intel…"
        aria-label="Search mission intel"
        loading
      />
    ),
    actions: (
      <div className="flex items-center gap-2">
        <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
        <Button size="sm" variant="primary" loading>
          Deploy
        </Button>
        <Button size="sm" variant="ghost" disabled>
          Disabled
        </Button>
      </div>
    ),
  }}
>
  <div className="grid gap-4 md:grid-cols-12">
    <div className="md:col-span-7 space-y-3">
      <p className="text-ui text-muted-foreground">
        Default variant uses r-card-lg radius with px-6/md:px-7/lg:px-8 tokens and aligns content to the 12-column grid.
      </p>
    </div>
  </div>
</NeomorphicHeroFrame>

<NeomorphicHeroFrame as="nav" variant="compact" actionArea={{ align: "between" }}>
  <div className="grid gap-3 md:grid-cols-12">
    <div className="md:col-span-6">
      <p className="text-ui text-muted-foreground">
        Compact variant swaps to r-card-md radius with px-4/md:px-5/lg:px-6 spacing.
      </p>
    </div>
  </div>
</NeomorphicHeroFrame>`,
    },
    {
      id: "page-header-demo",
      name: "PageHeader",
      description:
        "Neomorphic hero header that defaults to a calm single-frame layout, forwards standard HTML attributes, and can be remapped with the as prop.",
      element: <PageHeaderDemo />,
      tags: ["hero", "header"],
      code: `<PageHeaderDemo />`,
    },
    {
      id: "hero",
      name: "Hero",
      description:
        "Stacked hero shell with search and actions — default spacing plus frame-ready paddingless variant.",
      element: (
        <div className="space-y-[var(--space-4)]">
          <Hero
            heading="Hero"
            eyebrow="Eyebrow"
            subtitle="Subtitle"
            sticky={false}
            search={{ value: "", onValueChange: () => {}, round: true }}
            actions={<Button size="sm">Action</Button>}
          >
            <div className="text-ui text-muted-foreground">Body content</div>
          </Hero>
          <NeomorphicHeroFrame variant="plain">
            <Hero
              heading="Frame-ready hero"
              eyebrow="No padding"
              subtitle="Outer shell handles spacing"
              sticky={false}
              tone="supportive"
              frame={false}
              rail={false}
              padding="none"
            >
              <div className="text-ui text-muted-foreground">Body content</div>
            </Hero>
          </NeomorphicHeroFrame>
        </div>
      ),
      tags: ["hero", "layout"],
      code: `<Hero
  heading="Hero"
  eyebrow="Eyebrow"
  subtitle="Subtitle"
  sticky={false}
  search={{ value: "", onValueChange: () => {}, round: true }}
  actions={<Button size="sm">Action</Button>}
>
  <div className="text-ui text-muted-foreground">Body content</div>
</Hero>

<NeomorphicHeroFrame variant="plain">
  <Hero
    heading="Frame-ready hero"
    eyebrow="No padding"
    subtitle="Outer shell handles spacing"
    sticky={false}
    tone="supportive"
    frame={false}
    rail={false}
    padding="none"
  >
    <div className="text-ui text-muted-foreground">Body content</div>
  </Hero>
</NeomorphicHeroFrame>`,
    },
    {
      id: "hero-portrait-frame",
      name: "HeroPortraitFrame",
      description:
        "Circular neumorphic portrait frame with lavender glow and glitch accent rim built from semantic tokens.",
      element: (
        <div className="flex justify-center">
          <HeroPortraitFrame
            imageSrc="/hero_image.png"
            imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
          />
        </div>
      ),
      tags: ["hero", "portrait", "glitch"],
      code: `<HeroPortraitFrame
  imageSrc="/hero_image.png"
  imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
/>`,
    },
    {
      id: "welcome-hero-figure",
      name: "WelcomeHeroFigure",
      description:
        "Hero automation figure framed in a haloed neumorphic ring with eager loading tuned for the landing experience.",
      element: (
        <div className="mx-auto flex w-full max-w-[calc(var(--space-8) * 4.5)] justify-center">
          <WelcomeHeroFigure />
        </div>
      ),
      tags: ["hero", "figure", "neomorphic"],
      code: `<WelcomeHeroFigure />`,
    },
  ],
  feedback: [
    {
      id: "progress",
      name: "Progress",
      element: <Progress value={33} />,
      tags: ["progress"],
      code: `<Progress value={33} />`,
    },
    {
      id: "snackbar",
      name: "Snackbar",
      element: <SnackbarShowcase />,
      tags: ["snackbar", "feedback"],
      code: `<Snackbar message="Saved" actionLabel="Undo" onAction={() => {}} />`,
    },
    {
      id: "skeleton",
      name: "Skeleton",
      description: "Shimmer placeholder for loading layouts.",
      element: <SkeletonShowcase />,
      tags: ["skeleton", "loading", "feedback"],
      code: `<div className="space-y-2">
  <Skeleton
    ariaHidden={false}
    role="status"
    aria-label="Loading primary title"
    className="h-6 w-2/5 sm:w-1/3"
    radius="card"
  />
  <Skeleton className="w-3/4" />
  <Skeleton radius="full" className="h-10 w-10" />
</div>`,
    },
    {
      id: "spinner",
      name: "Spinner",
      element: <SpinnerShowcase />,
      tags: ["spinner", "loading"],
      code: `<Spinner size={24} />`,
    },
  ],
  toggles: [
    {
      id: "toggle",
      name: "Toggle",
      element: <ToggleShowcase />,
      tags: ["toggle"],
      code: `const [value, setValue] = React.useState<"Left" | "Right">("Left");
<Toggle value={value} onChange={setValue} />`,
    },
    {
      id: "animation-toggle",
      name: "AnimationToggle",
      element: (
        <div className="flex gap-4">
          <AnimationToggle />
          <AnimationToggle loading />
        </div>
      ),
      tags: ["toggle", "animation"],
      code: `<AnimationToggle />
<AnimationToggle loading />`,
    },
    {
      id: "theme-toggle",
      name: "ThemeToggle",
      element: <ThemeToggle />,
      tags: ["theme", "toggle"],
      code: `<ThemeToggle />`,
    },
    {
      id: "check-circle",
      name: "CheckCircle",
      element: (
        <div className="flex gap-4">
          <CheckCircle checked={false} onChange={() => {}} size="md" />
          <CheckCircle checked onChange={() => {}} size="md" />
        </div>
      ),
      tags: ["checkbox", "toggle"],
      code: `<CheckCircle checked={false} onChange={() => {}} size="md" />
<CheckCircle checked onChange={() => {}} size="md" />`,
    },
  ],
  league: [
    {
      id: "side-selector",
      name: "SideSelector",
      element: (
        <div className="flex flex-col gap-4">
          <SideSelector />
          <SideSelector disabled />
        </div>
      ),
      tags: ["side", "selector"],
      code: `<SideSelector />
<SideSelector disabled />`,
    },
    {
      id: "champ-list-editor",
      name: "ChampListEditor",
      description: "Shared champion list editor with toggleable state.",
      element: <ChampListEditorDemo />,
      tags: ["champion", "editor"],
      code: `<ChampListEditor
  list={list}
  onChange={setList}
  editing={editing}
  emptyLabel="-"
  viewClassName="champ-badges mt-1 flex flex-wrap gap-2"
/>`,
    },
    {
      id: "pillar-badge",
      name: "PillarBadge",
      element: (
        <div className="flex gap-4">
          <PillarBadge pillar="Wave" />
          <PillarBadge pillar="Trading" active />
        </div>
      ),
      tags: ["pillar", "badge"],
      code: `<PillarBadge pillar="Wave" />
<PillarBadge pillar="Trading" active />`,
    },
    {
      id: "pillar-selector",
      name: "PillarSelector",
      element: <PillarSelector />,
      tags: ["pillar", "selector"],
      code: `<PillarSelector />`,
    },
    {
      id: "lane-opponent-form",
      name: "LaneOpponentForm",
      element: (
        <LaneOpponentForm
          lane="Ashe/Lulu"
          opponent="Draven/Thresh"
          commitMeta={() => {}}
        />
      ),
      tags: ["lane", "opponent"],
      code: `<LaneOpponentForm lane="Ashe/Lulu" opponent="Draven/Thresh" commitMeta={() => {}} />`,
    },
    {
      id: "result-score-section",
      name: "ResultScoreSection",
      element: (
        <ResultScoreSection result="Win" score={5} commitMeta={() => {}} />
      ),
      tags: ["result", "score"],
      code: `<ResultScoreSection result="Win" score={5} commitMeta={() => {}} />`,
    },
    {
      id: "pillars-selector", // new component
      name: "PillarsSelector",
      element: <ReviewsPillarsSelector commitMeta={() => {}} pillars={[]} />,
      tags: ["pillars", "selector"],
      code: `<PillarsSelector pillars={[]} commitMeta={() => {}} />`,
    },
    {
      id: "timestamp-markers",
      name: "TimestampMarkers",
      element: <TimestampMarkers markers={[]} commitMeta={() => {}} />,
      tags: ["timestamp", "marker"],
      code: `<TimestampMarkers markers={[]} commitMeta={() => {}} />`,
    },
  ],
  misc: [
    {
      id: "badge",
      name: "Badge",
      element: <Badge>Badge</Badge>,
      tags: ["badge"],
      code: `<Badge>Badge</Badge>`,
    },
    {
      id: "theme-picker",
      name: "ThemePicker",
      element: <ThemePickerDemo />,
      tags: ["theme", "picker"],
      code: `<ThemePicker variant="default" />`,
    },
    {
      id: "background-picker",
      name: "BackgroundPicker",
      element: <BackgroundPickerDemo />,
      tags: ["background", "picker"],
      code: `<BackgroundPicker bg="aurora" />`,
    },
    {
      id: "role-selector",
      name: "RoleSelector",
      element: <RoleSelectorDemo />,
      tags: ["role", "selector"],
      code: `<RoleSelector value={role} onChange={setRole} />`,
    },
    {
      id: "review-list-item",
      name: "ReviewListItem",
      element: <ReviewListItem review={demoReview} />,
      tags: ["review", "list"],
      code: `<ReviewListItem review={demoReview} />`,
    },
    {
      id: "badge-tones",
      name: "Badge Tones",
      element: (
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="primary">Primary</Badge>
        </div>
      ),
      tags: ["badge", "tone"],
      code: `<div className="flex flex-wrap gap-2">
  <Badge tone="neutral">Neutral</Badge>
  <Badge tone="accent">Accent</Badge>
  <Badge tone="primary">Primary</Badge>
</div>`,
    },
    {
      id: "cat-companion",
      name: "CatCompanion",
      element: <CatCompanion />,
      tags: ["cat", "companion"],
      code: `<CatCompanion />`,
    },
  ],
};

const formatSectionLabel = (section: Section) =>
  section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const SECTION_TABS: HeaderTab<Section>[] = (
  Object.keys(SPEC_DATA) as Section[]
).map((key) => ({
  key,
  label: formatSectionLabel(key),
}));
