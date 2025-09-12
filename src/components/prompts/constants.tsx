import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  SegmentedButton,
  Badge,
  Card,
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
  Hero2,
  SectionCard as UiSectionCard,
  type HeaderTab,
  type TabItem,
} from "@/components/ui";
import GoalListDemo from "./GoalListDemo";
import PromptList from "./PromptList";
import { DashboardCard, BottomNav, IsometricRoom } from "@/components/home";
import { RoleSelector } from "@/components/reviews";
import ReviewListItem from "@/components/reviews/ReviewListItem";
import type { PromptWithTitle } from "./usePrompts";
import type { Review } from "@/lib/types";
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
  | "misc";

export type Spec = {
  id: string;
  name: string;
  description?: string;
  element: React.ReactNode;
  tags: string[];
  props?: { label: string; value: string }[];
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
    },
  ],
  inputs: [
    {
      id: "input",
      name: "Input",
      description: "Standard text input",
      element: <Input placeholder="Type here" />,
      tags: ["input", "text"],
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
    },
  ],
  prompts: [
    {
      id: "prompt-list",
      name: "PromptList",
      description: "Prompt filtering",
      element: <PromptList prompts={demoPrompts} query="" />,
      tags: ["prompt", "list"],
    },
    {
      id: "goal-list-demo",
      name: "GoalListDemo",
      element: <GoalListDemo />,
      tags: ["goal", "list"],
    },
  ],
  planner: [
    {
      id: "dashboard-card",
      name: "DashboardCard",
      element: <DashboardCard title="Demo" />,
      tags: ["dashboard", "card"],
    },
    {
      id: "bottom-nav",
      name: "BottomNav",
      element: <BottomNav />,
      tags: ["nav", "bottom"],
    },
    {
      id: "isometric-room",
      name: "IsometricRoom",
      element: <IsometricRoom variant="aurora" />,
      tags: ["room", "3d"],
    },
    {
      id: "goals-progress",
      name: "GoalsProgress",
      element: <GoalsProgress total={3} pct={50} />,
      tags: ["goals", "progress"],
    },
    {
      id: "reminders-tab",
      name: "RemindersTab",
      element: <RemindersTab />,
      tags: ["reminders", "tab"],
    },
    {
      id: "timer-ring",
      name: "TimerRing",
      element: <TimerRing pct={42} />,
      tags: ["timer", "ring"],
    },
    {
      id: "timer-tab",
      name: "TimerTab",
      element: <TimerTab />,
      tags: ["timer", "tab"],
    },
    {
      id: "progress-ring-icon",
      name: "ProgressRingIcon",
      element: <ProgressRingIcon pct={50} />,
      tags: ["icon", "progress"],
    },
    {
      id: "timer-ring-icon",
      name: "TimerRingIcon",
      element: <TimerRingIcon pct={75} />,
      tags: ["icon", "timer"],
    },
  ],
  layout: [
    {
      id: "card-demo",
      name: "Card",
      element: <CardDemo />,
      tags: ["card", "layout"],
    },
    {
      id: "sheet-demo",
      name: "Sheet",
      element: <SheetDemo />,
      tags: ["sheet", "overlay"],
    },
    {
      id: "modal-demo",
      name: "Modal",
      element: <ModalDemo />,
      tags: ["modal", "overlay"],
    },
    {
      id: "toast-demo",
      name: "Toast",
      element: <ToastDemo />,
      tags: ["toast", "feedback"],
    },
  ],
  misc: [
    {
      id: "badge",
      name: "Badge",
      element: <Badge>Badge</Badge>,
      tags: ["badge"],
    },
    {
      id: "theme-picker",
      name: "ThemePicker",
      element: <ThemePickerDemo />,
      tags: ["theme", "picker"],
    },
    {
      id: "background-picker",
      name: "BackgroundPicker",
      element: <BackgroundPickerDemo />,
      tags: ["background", "picker"],
    },
    {
      id: "role-selector",
      name: "RoleSelector",
      element: <RoleSelector value="MID" onChange={() => {}} />,
      tags: ["role", "selector"],
    },
    {
      id: "review-list-item",
      name: "ReviewListItem",
      element: <ReviewListItem review={demoReview} />,
      tags: ["review", "list"],
    },
    {
      id: "hero2",
      name: "Hero2",
      element: (
        <Hero2
          heading="Hero2 heading"
          subtitle="Optional description"
        />
      ),
      tags: ["hero"],
    },
    {
      id: "progress",
      name: "Progress",
      element: <Progress value={33} />,
      tags: ["progress"],
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
    },
  ],
};

export const SECTION_TABS: TabItem<Section>[] = (
  Object.keys(SPEC_DATA) as Section[]
).map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));
