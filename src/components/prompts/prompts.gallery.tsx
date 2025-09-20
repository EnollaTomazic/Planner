import * as React from "react";
import {
  createGalleryPreview,
  defineGallerySection,
  type GalleryEntryKind,
  type GallerySection,
  type GallerySectionId,
} from "@/components/gallery/registry";
import {
  Button,
  Card,
  NeoCard,
  neoCardOverlayClassName,
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
  SettingsSelect,
  Progress,
  Split,
  TitleBar,
  AnimationToggle,
  CatCompanion,
  ThemeToggle,
  CheckCircle,
  Snackbar,
  Skeleton,
  SideSelector,
  PillarBadge,
  PillarSelector,
  Hero,
  NeomorphicHeroFrame,
  PageShell,
  SectionCard as UiSectionCard,
  Spinner,
} from "@/components/ui";
import DemoHeader from "./DemoHeader";
import GoalListDemo from "./GoalListDemo";
import OutlineGlowDemo from "./OutlineGlowDemo";
import PromptList from "./PromptList";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import PromptsHeader from "./PromptsHeader";
import SpinnerShowcase from "./SpinnerShowcase";
import SnackbarShowcase from "./SnackbarShowcase";
import SkeletonShowcase from "./SkeletonShowcase";
import ToggleShowcase from "./ToggleShowcase";
import PageHeaderDemo from "./PageHeaderDemo";
import NeomorphicHeroFrameDemo from "./NeomorphicHeroFrameDemo";
import {
  DashboardCard,
  DashboardList,
  IsometricRoom,
  QuickActionGrid,
  HeroPortraitFrame,
  WelcomeHeroFigure,
} from "@/components/home";
import { NAV_ITEMS, type NavItem } from "@/components/chrome/nav-items";
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
import type { PromptWithTitle } from "./types";
import type { Review, Role } from "@/lib/types";
import { VARIANTS, defaultTheme } from "@/lib/theme";
import {
  GoalsProgress,
  RemindersTab,
  TimerRing,
  TimerTab,
} from "@/components/goals";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";
import { ProgressRingIcon, TimerRingIcon } from "@/icons";
import { cn } from "@/lib/utils";

type LegacySpec = {
  id: string;
  name: string;
  description?: string;
  element: React.ReactNode;
  tags: string[];
  props?: { label: string; value: string }[];
  code: string;
  states?: {
    id: string;
    name: string;
    description?: string;
    element: React.ReactNode;
    code?: string;
  }[];
  usage?: { kind: "do" | "dont"; title: string; description: string }[];
};

const demoPrompts: PromptWithTitle[] = [
  {
    id: "p1",
    title: "Demo prompt",
    text: "",
    createdAt: Date.now(),
  },
];

const demoReview: Review = {
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

const SECTION_KIND_MAP: Record<GallerySectionId, GalleryEntryKind> = {
  buttons: "primitive",
  inputs: "primitive",
  toggles: "primitive",
  feedback: "primitive",
  prompts: "component",
  cards: "component",
  layout: "component",
  "page-header": "component",
  misc: "component",
  homepage: "complex",
  reviews: "complex",
  planner: "complex",
  goals: "complex",
  team: "complex",
  components: "complex",
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

function SettingsSelectDemo() {
  const [value, setValue] = React.useState<string>(VARIANTS[0]?.id ?? "");
  const items = React.useMemo(
    () => VARIANTS.map(({ id, label }) => ({ value: id, label })),
    [],
  );

  return (
    <div className="stack-sm">
      <SettingsSelect
        ariaLabel="Theme"
        prefixLabel="Theme"
        items={items}
        value={value}
        onChange={setValue}
      />
      <SettingsSelect
        ariaLabel="Theme (disabled)"
        prefixLabel="Theme (disabled)"
        items={items}
        value={value}
        onChange={setValue}
        disabled
      />
    </div>
  );
}

function ReviewSurfaceDemo() {
  return (
    <ReviewSurface padding="md" tone="muted">
      <div className="text-ui text-foreground/70">Surface content</div>
    </ReviewSurface>
  );
}

type BottomNavState = "default" | "active" | "disabled" | "syncing";
type BottomNavDemoMode = "combined" | "active" | "disabled" | "syncing";
type BottomNavDemoItem = NavItem & { state: BottomNavState };

const BOTTOM_NAV_STATE_DETAILS: Array<{
  key: Exclude<BottomNavDemoMode, "combined">;
  title: string;
  description: string;
}> = [
  {
    key: "active",
    title: "Active tab",
    description:
      "Accent typography and the theme ring token pin the current Planner route.",
  },
  {
    key: "disabled",
    title: "Disabled tab",
    description:
      "Muted foreground copy with the global disabled opacity token communicates unavailable sections.",
  },
  {
    key: "syncing",
    title: "Syncing tab",
    description:
      "A compact spinner uses accent border tokens to show background sync progress next to the label.",
  },
];

function createBottomNavItems(mode: BottomNavDemoMode = "combined") {
  const states = new Map<string, BottomNavState>();

  NAV_ITEMS.forEach((item) => {
    states.set(item.href, "default");
  });

  if (mode === "combined" || mode === "active") {
    states.set("/planner", "active");
  }

  if (mode === "combined" || mode === "syncing") {
    states.set("/reviews", "syncing");
  }

  if (mode === "combined" || mode === "disabled") {
    states.set("/team", "disabled");
  }

  return NAV_ITEMS.map<BottomNavDemoItem>((item) => ({
    ...item,
    state: states.get(item.href) ?? "default",
  }));
}

function BottomNavStatesDemo({ mode = "combined" }: { mode?: BottomNavDemoMode }) {
  const items = React.useMemo(() => createBottomNavItems(mode), [mode]);

  return (
    <div className="space-y-[var(--space-4)]">
      <nav
        aria-label="Planner bottom navigation"
        className="rounded-card r-card-lg border border-border bg-surface-2 px-[var(--space-4)] py-[var(--space-3)] shadow-neoSoft"
      >
        <ul className="flex items-stretch justify-around gap-[var(--space-2)]">
          {items.map(({ href, label, mobileIcon: Icon, state }) => {
            if (!Icon) {
              return null;
            }

            return (
              <li key={`${mode}-${href}`}>
                <button
                  type="button"
                  disabled={state === "disabled"}
                  aria-pressed={state === "active" ? true : undefined}
                  aria-busy={state === "syncing" ? true : undefined}
                  data-state={state}
                  className={cn(
                    "group flex min-h-[var(--control-h-lg)] flex-col items-center gap-[var(--space-1)] rounded-card r-card-md px-[var(--space-5)] py-[var(--space-3)] text-label font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-[var(--disabled)] motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
                    state === "active" &&
                      "text-accent-3 ring-2 ring-[var(--theme-ring)]",
                    state === "default" &&
                      "text-muted-foreground hover:text-foreground",
                    state === "disabled" && "text-muted-foreground/70",
                    state === "syncing" && "text-foreground",
                  )}
                >
                  <span className="[&_svg]:size-[var(--space-4)]">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-[var(--space-1)]">
                    {label}
                    {state === "syncing" ? (
                      <Spinner size="var(--space-3)" />
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {mode === "combined" ? (
        <dl className="grid gap-[var(--space-3)] text-label text-muted-foreground">
          {BOTTOM_NAV_STATE_DETAILS.map(({ key, title, description }) => (
            <div key={key} className="space-y-[var(--space-1)]">
              <dt className="text-ui font-semibold text-foreground">{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
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
    <div className="space-y-[var(--space-3)]" data-scope="team">
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
        viewClassName="champ-badges mt-[var(--space-1)] flex flex-wrap gap-[var(--space-2)]"
      />
    </div>
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

function CardLoadingState() {
  return (
    <Card>
      <CardContent className="space-y-[var(--space-4)]">
        <div className="space-y-[var(--space-2)]">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading summary"
            className="h-[var(--space-6)] w-3/4"
            radius="sm"
          />
          <Skeleton className="w-full" />
          <Skeleton className="w-4/5" />
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <Skeleton
            className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
            radius="full"
          />
          <div className="flex-1 space-y-[var(--space-2)]">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CardErrorState() {
  return (
    <Card>
      <CardContent className="stack-md">
        <div className="stack-xs">
          <h4 className="text-ui font-semibold tracking-[-0.01em]">
            Data unavailable
          </h4>
          <p className="text-label text-muted-foreground">
            Refresh to request the latest match insights.
          </p>
        </div>
        <Snackbar
          message="Sync failed"
          actionLabel="Retry"
          onAction={() => {}}
          tone="danger"
          width="full"
        />
      </CardContent>
    </Card>
  );
}

function NeoCardDemo() {
  return (
    <NeoCard
      overlay={
        <div className={neoCardOverlayClassName} />
      }
    >
      <p className="text-ui">Body</p>
    </NeoCard>
  );
}

function NeoCardLoadingState() {
  return (
    <NeoCard>
      <div className="stack-lg">
        <div className="stack-sm">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading summary"
            className="h-[var(--space-6)] w-3/4"
            radius="sm"
          />
          <Skeleton className="w-full" />
          <Skeleton className="w-4/5" />
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <Skeleton
            className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
            radius="full"
          />
          <div className="flex-1 stack-sm">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-2/3" />
          </div>
        </div>
      </div>
    </NeoCard>
  );
}

function NeoCardErrorState() {
  return (
    <NeoCard>
      <div className="stack-md">
        <div className="stack-xs">
          <h4 className="text-ui font-semibold tracking-[-0.01em]">
            Overlay unavailable
          </h4>
          <p className="text-label text-muted-foreground">
            Refresh to retry the sync and restore overlay content.
          </p>
        </div>
        <Snackbar
          message="Sync failed"
          actionLabel="Retry"
          onAction={() => {}}
          tone="danger"
          width="full"
        />
      </div>
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

function PromptsHeaderDemo() {
  const [saved, setSaved] = React.useState(6);
  const [query, setQuery] = React.useState("focus");
  const handleSave = React.useCallback(() => {
    setSaved((prev) => prev + 1);
  }, []);

  return (
    <PromptsHeader
      count={saved}
      query={query}
      onQueryChange={setQuery}
      onSave={handleSave}
      disabled={query.trim().length === 0}
    />
  );
}

function PromptsComposePanelDemo() {
  const [title, setTitle] = React.useState("Review after scrims");
  const [text, setText] = React.useState(
    "Summarize three high-impact plays and next steps.",
  );

  return (
    <PromptsComposePanel
      title={title}
      onTitleChange={setTitle}
      text={text}
      onTextChange={setText}
    />
  );
}

function PromptListLoadingState() {
  return (
    <ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index}>
          <Card className="space-y-[var(--space-3)] p-[var(--space-3)]">
            <div className="flex items-center justify-between">
              <Skeleton
                ariaHidden={false}
                role="status"
                aria-label="Loading prompt title"
                className="h-[var(--space-5)] w-[calc(100%-var(--space-6))]"
                radius="sm"
              />
              <Skeleton
                className="h-[var(--space-4)] w-[calc(var(--space-8)*1.5)]"
                radius="sm"
              />
            </div>
            <div className="space-y-[var(--space-2)]">
              <Skeleton className="w-full" />
              <Skeleton className="w-[calc(100%-var(--space-6))]" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function PromptListEmptyState() {
  return <PromptList prompts={[]} query="" />;
}

function DemoHeaderShowcase() {
  const [role, setRole] = React.useState<Role>("MID");
  const [fruit, setFruit] = React.useState<string>("apple");

  return (
    <DemoHeader
      role={role}
      onRoleChange={setRole}
      fruit={fruit}
      onFruitChange={setFruit}
    />
  );
}
const LEGACY_SPEC_DATA: Record<GallerySectionId, LegacySpec[]> = {
  buttons: [],
  inputs: [],
  prompts: [
    {
      id: "prompt-list",
      name: "PromptList",
      description: "Prompt filtering",
      element: <PromptList prompts={demoPrompts} query="" />,
      tags: ["prompt", "list"],
      code: `<PromptList prompts={demoPrompts} query="" />`,
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Skeleton cards preserve the prompt layout while entries sync from storage.",
          element: <PromptListLoadingState />,
          code: `<ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
  {Array.from({ length: 3 }).map((_, index) => (
    <li key={index}>
      <Card className="space-y-[var(--space-3)] p-[var(--space-3)]">
        <div className="flex items-center justify-between">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading prompt title"
            className="h-[var(--space-5)] w-[calc(100%-var(--space-6))]"
            radius="sm"
          />
          <Skeleton
            className="h-[var(--space-4)] w-[calc(var(--space-8)*1.5)]"
            radius="sm"
          />
        </div>
        <div className="space-y-[var(--space-2)]">
          <Skeleton className="w-full" />
          <Skeleton className="w-[calc(100%-var(--space-6))]" />
        </div>
      </Card>
    </li>
  ))}
</ul>`,
        },
        {
          id: "empty",
          name: "Empty",
          description:
            "Muted guidance keeps the workspace clear when no prompts have been saved yet.",
          element: <PromptListEmptyState />,
          code: `<PromptList prompts={[]} query="" />`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Match skeleton rhythm to saved cards",
          description:
            "Align placeholder spacing with prompt titles and bodies so loading feels stable.",
        },
        {
          kind: "do",
          title: "Confirm empty states with guidance",
          description:
            "Surface contextual copy that explains whether no prompts exist or filters removed results.",
        },
        {
          kind: "dont",
          title: "Avoid blank panels",
          description:
            "Never leave the list empty without skeletons or helper text; it reads as a rendering failure.",
        },
      ],
    },
    {
      id: "prompts-header",
      name: "PromptsHeader",
      description: "Prompts workspace header with search, chips, and save action.",
      element: <PromptsHeaderDemo />,
      tags: ["prompts", "header", "search"],
      code: `function PromptsHeaderDemo() {
  const [saved, setSaved] = React.useState(6);
  const [query, setQuery] = React.useState("focus");

  return (
    <PromptsHeader
      count={saved}
      query={query}
      onQueryChange={setQuery}
      onSave={() => setSaved((prev) => prev + 1)}
      disabled={query.trim().length === 0}
    />
  );
}`,
    },
    {
      id: "prompts-compose-panel",
      name: "PromptsComposePanel",
      description: "Compose prompts with labelled title and textarea controls.",
      element: <PromptsComposePanelDemo />,
      tags: ["prompts", "form"],
      code: `function PromptsComposePanelDemo() {
  const [title, setTitle] = React.useState("Review after scrims");
  const [text, setText] = React.useState(
    "Summarize three high-impact plays and next steps.",
  );

  return (
    <PromptsComposePanel
      title={title}
      onTitleChange={setTitle}
      text={text}
      onTextChange={setText}
    />
  );
}`,
    },
    {
      id: "prompts-demos",
      name: "PromptsDemos",
      description: "Comprehensive component playground for prompts surfaces.",
      element: <PromptsDemos />,
      tags: ["prompts", "gallery", "demo"],
      code: `<PromptsDemos />`,
    },
  ],
  planner: [
    {
      id: "bottom-nav",
      name: "BottomNav",
      description:
        "Mobile Planner nav demo showing active, disabled, and syncing tabs styled with tokens.",
      element: <BottomNavStatesDemo />,
      tags: ["nav", "bottom"],
      code: `<BottomNavStatesDemo />`,
      states: [
        {
          id: "active",
          name: "Active tab",
          description:
            "Accent text plus the theme ring token anchor the current Planner route.",
          element: <BottomNavStatesDemo mode="active" />,
          code: `<BottomNavStatesDemo mode="active" />`,
        },
        {
          id: "disabled",
          name: "Disabled tab",
          description:
            "Muted foreground copy and the global disabled opacity token signal unavailable sections.",
          element: <BottomNavStatesDemo mode="disabled" />,
          code: `<BottomNavStatesDemo mode="disabled" />`,
        },
        {
          id: "syncing",
          name: "Syncing tab",
          description:
            "A compact spinner with accent borders communicates background sync progress beside the label.",
          element: <BottomNavStatesDemo mode="syncing" />,
          code: `<BottomNavStatesDemo mode="syncing" />`,
        },
      ],
    },
  ],
  cards: [
    {
      id: "card-demo",
      name: "Card",
      description:
        "Standard card surface with header spacing set to the space-2 token for consistent vertical rhythm.",
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
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Skeleton placeholders mirror card layout to communicate asynchronous loading.",
          element: <CardLoadingState />,
          code: `<Card>
  <CardContent className="space-y-[var(--space-4)]">
    <div className="space-y-[var(--space-2)]">
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading summary"
        className="h-[var(--space-6)] w-3/4"
        radius="sm"
      />
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
    </div>
    <div className="flex items-center gap-[var(--space-3)]">
      <Skeleton
        className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
        radius="full"
      />
      <div className="flex-1 space-y-[var(--space-2)]">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  </CardContent>
</Card>`,
        },
        {
          id: "error",
          name: "Error",
          description:
            "Snackbar feedback surfaces failure messaging with a retry action inside the card shell.",
          element: <CardErrorState />,
          code: `<Card>
  <CardContent className="space-y-[var(--space-3)]">
    <div className="space-y-[var(--space-1)]">
      <h4 className="text-ui font-semibold tracking-[-0.01em]">
        Data unavailable
      </h4>
      <p className="text-label text-muted-foreground">
        Refresh to request the latest match insights.
      </p>
    </div>
    <Snackbar
      message="Sync failed"
      actionLabel="Retry"
      onAction={() => {}}
      tone="danger"
      width="full"
    />
  </CardContent>
</Card>`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Use skeletons for async fetches",
          description:
            "Mirror the content hierarchy with Skeleton components so loading feels intentional and steady.",
        },
        {
          kind: "do",
          title: "Keep messaging concise",
          description:
            "Card headlines should be short and scannable to reinforce the surrounding dashboard context.",
        },
        {
          kind: "dont",
          title: "Do not mix button tones",
          description:
            "Cards should avoid multiple competing button tones; reserve the primary action for the footer.",
        },
      ],
    },
    {
      id: "neo-card-demo",
      name: "NeoCard",
      element: <NeoCardDemo />,
      tags: ["card", "overlay", "layout"],
      code: `<NeoCard
  overlay={<div className="neo-card__overlay" />}
>
  <p className="text-ui">Body</p>
</NeoCard>`,
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Neo shell supports skeletons while preserving raised lighting cues.",
          element: <NeoCardLoadingState />,
          code: `<NeoCard className="p-[var(--space-4)]">
  <div className="space-y-[var(--space-4)]">
    <div className="space-y-[var(--space-2)]">
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading summary"
        className="h-[var(--space-6)] w-3/4"
        radius="sm"
      />
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
    </div>
    <div className="flex items-center gap-[var(--space-3)]">
      <Skeleton
        className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
        radius="full"
      />
      <div className="flex-1 space-y-[var(--space-2)]">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  </div>
</NeoCard>`,
        },
        {
          id: "error",
          name: "Error",
          description:
            "Surface retry messaging within the Neo overlay while maintaining blend effects.",
          element: <NeoCardErrorState />,
          code: `<NeoCard className="p-[var(--space-4)]">
  <div className="space-y-[var(--space-3)]">
    <div className="space-y-[var(--space-1)]">
      <h4 className="text-ui font-semibold tracking-[-0.01em]">
        Overlay unavailable
      </h4>
      <p className="text-label text-muted-foreground">
        Refresh to retry the sync and restore overlay content.
      </p>
    </div>
    <Snackbar
      message="Sync failed"
      actionLabel="Retry"
      onAction={() => {}}
      tone="danger"
      width="full"
    />
  </div>
</NeoCard>`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Use overlays for featured content",
          description:
            "Neo cards work best when highlighting premium or hero content that benefits from glow and depth.",
        },
        {
          kind: "dont",
          title: "Avoid dense layouts",
          description:
            "Do not overload Neo cards with complex forms; reserve them for concise summaries or highlights.",
        },
      ],
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
      id: "page-shell",
      name: "PageShell",
      description:
        "Responsive page container. Enable the grid prop and wrap sections in col-span-* to align to the shell template.",
      element: (
        <PageShell
          grid
          className="py-6"
          contentClassName="items-start"
        >
          <div className="col-span-full text-label font-semibold tracking-[0.02em] text-muted-foreground md:col-span-7">
            Page shell content
          </div>
          <div className="col-span-full flex items-center justify-end gap-[var(--space-3)] md:col-span-5 md:justify-self-end">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="ghost">
              Secondary
            </Button>
          </div>
        </PageShell>
      ),
      tags: ["layout", "shell"],
      code: `<PageShell
  grid
  className="py-6"
  contentClassName="items-start"
>
  <div className="col-span-full text-label font-semibold tracking-[0.02em] text-muted-foreground md:col-span-7">
    Page shell content
  </div>
  <div className="col-span-full flex items-center justify-end gap-[var(--space-3)] md:col-span-5 md:justify-self-end">
    <Button size="sm">Primary</Button>
    <Button size="sm" variant="ghost">
      Secondary
    </Button>
  </div>
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
      id: "split",
      name: "Split",
      element: (
        <Split
          left={<div className="p-[var(--space-4)]">Left</div>}
          right={<div className="p-[var(--space-4)]">Right</div>}
        />
      ),
      tags: ["split", "layout"],
      code: `<Split left={<div>Left</div>} right={<div>Right</div>} />`,
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
  slots={{
    tabs: {
      node: (
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
      label: "Switch mission focus",
    },
    search: {
      node: (
        <SearchBar
          value=""
          onValueChange={() => {}}
          placeholder="Search mission intel…"
          aria-label="Search mission intel"
          loading
        />
      ),
      label: "Search mission intel",
    },
    actions: {
      node: (
        <div className="flex items-center gap-[var(--space-2)]">
          <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
          <Button size="sm" variant="primary" loading>
            Deploy
          </Button>
          <Button size="sm" variant="ghost" disabled>
            Disabled
          </Button>
        </div>
      ),
      label: "Mission quick actions",
    },
  }}
>
  <HeroGrid>
    <HeroCol span={7} className="space-y-[var(--space-3)]">
      <p className="text-ui text-muted-foreground">
        Default variant uses r-card-lg radius with px-6/md:px-7/lg:px-8 tokens and aligns content to the 12-column grid.
      </p>
    </HeroCol>
  </HeroGrid>
</NeomorphicHeroFrame>

<NeomorphicHeroFrame as="nav" variant="compact" align="between">
  <HeroGrid variant="compact">
    <HeroCol span={6}>
      <p className="text-ui text-muted-foreground">
        Compact variant swaps to r-card-md radius with px-4/md:px-5/lg:px-6 spacing.
      </p>
    </HeroCol>
  </HeroGrid>
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
      id: "demo-header",
      name: "DemoHeader",
      description:
        "Composite header, hero, banner, and review highlights wired together for hand-off demos.",
      element: <DemoHeaderShowcase />,
      tags: ["header", "hero", "layout"],
      code: `function DemoHeaderShowcase() {
  const [role, setRole] = React.useState("MID");
  const [fruit, setFruit] = React.useState("apple");

  return (
    <DemoHeader
      role={role}
      onRoleChange={setRole}
      fruit={fruit}
      onFruitChange={setFruit}
    />
  );
}`,
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
          <NeomorphicHeroFrame variant="dense">
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

<NeomorphicHeroFrame variant="dense">
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
      id: "outline-glow",
      name: "OutlineGlowDemo",
      description: "Focus ring glow tokens and disabled outline states.",
      element: <OutlineGlowDemo />,
      tags: ["focus", "state", "demo"],
      code: `<div className="flex gap-[var(--space-2)]">
  <button
    type="button"
    className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface"
    style={{ "--focus": "var(--focus)" }}
  >
    Focus me to see the glow
  </button>
  <button
    type="button"
    disabled
    className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface disabled:cursor-not-allowed"
    style={{ "--focus": "var(--focus)" }}
  >
    Disabled example
  </button>
</div>`,
    },
    {
      id: "snackbar",
      name: "Snackbar",
      element: <SnackbarShowcase />,
      tags: ["snackbar", "feedback"],
      code: `<Snackbar message="Saved" actionLabel="Undo" onAction={() => {}} />`,
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
  homepage: [
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
      id: "isometric-room",
      name: "IsometricRoom",
      element: <IsometricRoom variant="aurora" />,
      tags: ["room", "3d"],
      code: `<IsometricRoom variant="aurora" />`,
    },
    {
      id: "quick-action-grid",
      name: "QuickActionGrid",
      description: "Maps quick action configs to styled planner shortcuts",
      element: (
        <QuickActionGrid
          actions={[
            { href: "/planner", label: "Planner Today" },
            { href: "/goals", label: "New Goal", tone: "accent" },
            { href: "/reviews", label: "New Review", tone: "accent" },
          ]}
          layout="inline"
          buttonSize="lg"
          hoverLift
        />
      ),
      tags: ["actions", "planner"],
      code: `<QuickActionGrid
  actions={[
    { href: "/planner", label: "Planner Today" },
    { href: "/goals", label: "New Goal", tone: "accent" },
    { href: "/reviews", label: "New Review", tone: "accent" },
  ]}
  layout="inline"
  buttonSize="lg"
  hoverLift
/>`,
    },
    {
      id: "hero-portrait-frame",
      name: "HeroPortraitFrame",
      description:
        "Circular neumorphic portrait frame with lavender glow and glitch accent rim built from semantic tokens.",
      element: (
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
          <HeroPortraitFrame
            imageSrc="/hero_image.png"
            imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
          />
          <HeroPortraitFrame
            frame={false}
            imageSrc="/hero_image.png"
            imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
          />
        </div>
      ),
      tags: ["hero", "portrait", "glitch"],
      code: `<div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
  <HeroPortraitFrame
    imageSrc="/hero_image.png"
    imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
  />
  <HeroPortraitFrame
    frame={false}
    imageSrc="/hero_image.png"
    imageAlt="Illustration of the Planner hero floating above a holographic dashboard"
  />
</div>`,
    },
    {
      id: "welcome-hero-figure",
      name: "WelcomeHeroFigure",
      description:
        "Hero automation figure framed in a haloed neumorphic ring with eager loading tuned for the landing experience.",
      element: (
        <div className="mx-auto flex w-full max-w-[calc(var(--space-8) * 5)] justify-center">
          <WelcomeHeroFigure />
        </div>
      ),
      tags: ["hero", "figure", "neomorphic"],
      code: `<WelcomeHeroFigure />`,
    },
  ],
  reviews: [
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
      id: "review-list-item",
      name: "ReviewListItem",
      element: <ReviewListItem review={demoReview} />,
      tags: ["review", "list"],
      code: `<ReviewListItem review={demoReview} />`,
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
  goals: [
    {
      id: "goals-progress",
      name: "GoalsProgress",
      element: <GoalsProgress total={3} pct={50} />,
      tags: ["goals", "progress"],
      code: `<GoalsProgress total={3} pct={50} />`,
    },
    {
      id: "goal-list-demo",
      name: "GoalListDemo",
      element: <GoalListDemo />,
      tags: ["goal", "list"],
      code: `<GoalListDemo />`,
    },
    {
      id: "reminders-tab",
      name: "RemindersTab",
      element: (
        <RemindersProvider>
          <RemindersTab />
        </RemindersProvider>
      ),
      tags: ["reminders", "tab"],
      code: `<RemindersProvider>
  <RemindersTab />
</RemindersProvider>`,
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
  team: [
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
  viewClassName="champ-badges mt-[var(--space-1)] flex flex-wrap gap-[var(--space-2)]"
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
      id: "role-selector",
      name: "RoleSelector",
      element: <RoleSelectorDemo />,
      tags: ["role", "selector"],
      code: `<RoleSelector value={role} onChange={setRole} />`,
    },
  ],
  components: [
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
      id: "settings-select",
      name: "SettingsSelect",
      element: <SettingsSelectDemo />,
      tags: ["select", "settings"],
      code: `<div className="stack-sm">
  <SettingsSelect
    ariaLabel="Theme"
    prefixLabel="Theme"
    items={[{ value: "lg", label: "Glitch" }]}
    value="lg"
  />
  <SettingsSelect
    ariaLabel="Theme (disabled)"
    prefixLabel="Theme (disabled)"
    items={[{ value: "lg", label: "Glitch" }]}
    value="lg"
    disabled
  />
</div>`,
    },
  ],
  misc: [
    {
      id: "cat-companion",
      name: "CatCompanion",
      element: <CatCompanion />,
      tags: ["cat", "companion"],
      code: `<CatCompanion />`,
    },
  ],
};

const gallerySections: GallerySection[] = Object.entries(LEGACY_SPEC_DATA).map(
  ([sectionId, specs]) =>
    defineGallerySection({
      id: sectionId as GallerySectionId,
      entries: specs.map((spec) => ({
        id: spec.id,
        name: spec.name,
        description: spec.description,
        tags: spec.tags,
        props: spec.props?.map(({ label, value }) => ({
          name: label,
          type: value,
        })),
        kind: SECTION_KIND_MAP[sectionId as GallerySectionId] ?? "component",
        preview: createGalleryPreview({
          id: `prompts:${sectionId}:${spec.id}`,
          render: () => spec.element,
        }),
        code: spec.code,
        states: spec.states?.map((state) => ({
          id: state.id,
          name: state.name,
          description: state.description,
          code: state.code,
          preview: createGalleryPreview({
            id: `prompts:${sectionId}:${spec.id}:state:${state.id}`,
            render: () => state.element,
          }),
        })),
        usage: spec.usage,
      })),
    }),
);

export default gallerySections;
