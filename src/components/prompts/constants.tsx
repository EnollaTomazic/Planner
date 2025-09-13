import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  Textarea,
  SegmentedButton,
  Badge,
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
  SectionCard as UiSectionCard,
  type HeaderTab,
} from "@/components/ui";
import GoalListDemo from "./GoalListDemo";
import PromptList from "./PromptList";
import SelectShowcase from "./SelectShowcase";
import SpinnerShowcase from "./SpinnerShowcase";
import SnackbarShowcase from "./SnackbarShowcase";
import ToggleShowcase from "./ToggleShowcase";
import PageHeaderDemo from "./PageHeaderDemo";
import { DashboardCard, BottomNav, IsometricRoom } from "@/components/home";
import {
  RoleSelector,
  ReviewListItem,
  LaneOpponentForm,
  ResultScoreSection,
  PillarsSelector as ReviewsPillarsSelector,
  TimestampMarkers,
} from "@/components/reviews";
import type { PromptWithTitle } from "./usePrompts";
import type { Review, Role } from "@/lib/types";
import { COLOR_PALETTES, VARIANTS, defaultTheme } from "@/lib/theme";
import {
  GoalsProgress,
  RemindersTab,
  TimerRing,
  TimerTab,
} from "@/components/goals";
import { ProgressRingIcon, TimerRingIcon } from "@/icons";
import { Plus } from "lucide-react";

export type View = "components" | "colors" | "onboarding";
export type Section =
  | "buttons"
  | "inputs"
  | "prompts"
  | "planner"
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

export const VIEW_TABS: HeaderTab<View>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
  { key: "onboarding", label: "Onboarding" },
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

function HeaderTabsDemo() {
  const [tab, setTab] = React.useState("one");
  const tabs: HeaderTab<string>[] = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
  ];
  return (
    <Header
      heading="Header"
      tabs={{ items: tabs, value: tab, onChange: setTab }}
      sticky={false}
      topClassName="top-0"
    />
  );
}

function HeroDemo() {
  const [sub, setSub] = React.useState("one");
  const [query, setQuery] = React.useState("");
  const subTabs: HeaderTab<string>[] = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
  ];
  return (
    <Hero
      heading="Hero"
      subTabs={{ items: subTabs, value: sub, onChange: setSub }}
      search={{
        id: "hero-demo-search",
        value: query,
        onValueChange: setQuery,
        round: true,
        "aria-label": "Search",
      }}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm">Action</Button>
          <IconButton size="sm" aria-label="Add">
            <Plus />
          </IconButton>
        </div>
      }
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
        <p className="text-sm">Body</p>
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
      <p className="text-sm">Body</p>
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
            <p className="text-sm">Content</p>
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
            <p className="text-sm">Content</p>
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
      <Toast open={open} onOpenChange={setOpen}>
        <p className="text-sm">Toast message</p>
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
          <Button className="ring-2 ring-[--focus]">Focus</Button>
          <Button className="bg-[--active]">Active</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      ),
      tags: ["button", "states"],
      code: `<div className="flex flex-wrap gap-4">
  <Button>Default</Button>
  <Button className="bg-[--hover]">Hover</Button>
  <Button className="ring-2 ring-[--focus]">Focus</Button>
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
          <IconButton className="ring-2 ring-[--focus]" aria-label="Focus">
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
  <IconButton className="ring-2 ring-[--focus]" aria-label="Focus">
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
          <Input placeholder="Focus" className="ring-2 ring-[--focus]" />
          <Input placeholder="Active" className="bg-[--active]" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Loading" data-loading="true" />
        </div>
      ),
      tags: ["input", "states"],
      code: `<div className="flex flex-col gap-2">
  <Input placeholder="Default" />
  <Input placeholder="Hover" className="bg-[--hover]" />
  <Input placeholder="Focus" className="ring-2 ring-[--focus]" />
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
  <Select items={items} placeholder="Animated" />
  <Select variant="native" items={items} />
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
      id: "dashboard-card",
      name: "DashboardCard",
      element: <DashboardCard title="Demo" />,
      tags: ["dashboard", "card"],
      code: `<DashboardCard title="Demo" />`,
    },
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
  layout: [
    {
      id: "header-tabs",
      name: "Header Tabs",
      description: "Header with segmented tabs",
      element: <HeaderTabsDemo />,
      tags: ["header", "tabs"],
      code: `<Header
  heading="Header"
  tabs={{ items: [{ key: "one", label: "One" }, { key: "two", label: "Two" }], value: "one", onChange: () => {} }}
  sticky={false}
  topClassName="top-0"
/>`,
    },
    {
      id: "hero-demo",
      name: "Hero",
      description: "Hero with sub-tabs, search, and actions",
      element: <HeroDemo />,
      tags: ["hero"],
      code: `<Hero heading="Hero" subTabs={{ items: [{ key: "one", label: "One" }, { key: "two", label: "Two" }], value: "one", onChange: () => {} }} search={{ id: "hero-demo-search", value: "", onValueChange: () => {}, round: true, "aria-label": "Search" }} actions={<div className="flex items-center gap-2"><Button size="sm">Action</Button><IconButton size="sm" aria-label="Add"><Plus /></IconButton></div>} sticky={false} topClassName="top-0" />`,
    },
    {
      id: "neomorphic-hero-frame",
      name: "NeomorphicHeroFrame",
      description: "HUD-style frame shell",
      element: (
        <NeomorphicHeroFrame className="rounded-card r-card-lg px-4 py-4">
          <div className="relative z-[2] text-sm">Content</div>
        </NeomorphicHeroFrame>
      ),
      tags: ["hero", "layout"],
      code: `<NeomorphicHeroFrame className="rounded-card r-card-lg px-4 py-4">
  <div className="relative z-[2]">Content</div>
</NeomorphicHeroFrame>`,
    },
    {
      id: "page-header-demo",
      name: "PageHeader",
      element: <PageHeaderDemo />,
      tags: ["hero", "header"],
      code: `<PageHeaderDemo />`,
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
    <p className="text-sm">Body</p>
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
  <p className="text-sm">Body</p>
</NeoCard>`,
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
      <p className="text-sm">Content</p>
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
      <p className="text-sm">Content</p>
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
<Toast open><p className="text-sm">Toast message</p></Toast>`,
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
        />
      ),
      tags: ["tabs"],
      code: `<TabBar items={[{ key: "a", label: "A" }, { key: "b", label: "B" }]} defaultValue="a" />`,
    },
    {
      id: "title-bar",
      name: "TitleBar",
      element: <TitleBar label="Title" />,
      tags: ["title", "bar"],
      code: `<TitleBar label="Title" />`,
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
          <CheckCircle checked={false} onChange={() => {}} />
          <CheckCircle checked onChange={() => {}} />
        </div>
      ),
      tags: ["checkbox", "toggle"],
      code: `<CheckCircle checked={false} onChange={() => {}} />
<CheckCircle checked onChange={() => {}} />`,
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
      id: "variant-badges",
      name: "Variant Badges",
      element: (
        <div className="flex flex-wrap gap-2">
          {VARIANTS.map((v) => (
            <Badge key={v.id} variant="accent">
              {v.label}
            </Badge>
          ))}
        </div>
      ),
      tags: ["badge", "variant"],
      code: `<div className="flex flex-wrap gap-2">
  {VARIANTS.map((v) => (
    <Badge key={v.id} variant="accent">
      {v.label}
    </Badge>
  ))}
</div>`,
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
    {
      id: "cat-companion",
      name: "CatCompanion",
      element: <CatCompanion />,
      tags: ["cat", "companion"],
      code: `<CatCompanion />`,
    },
  ],
};

export const SECTION_TABS: HeaderTab<Section>[] = (
  Object.keys(SPEC_DATA) as Section[]
).map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));
