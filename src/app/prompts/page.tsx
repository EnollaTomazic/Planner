"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  SegmentedButton,
  TabBar,
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
  ThemeToggle,
  ThemePicker,
  BackgroundPicker,
  Header,
  Hero,
  Hero2,
  type TabItem,
  Progress,
} from "@/components/ui";
import UpdatesList from "@/components/prompts/UpdatesList";
import GoalListDemo from "@/components/prompts/GoalListDemo";
import PromptList from "@/components/prompts/PromptList";
import OnboardingTabs from "@/components/prompts/OnboardingTabs";
import type { PromptWithTitle } from "@/components/prompts/usePrompts";
import { Plus } from "lucide-react";
import { DashboardCard, BottomNav } from "@/components/home";
import { RoleSelector } from "@/components/reviews";
import ReviewListItem from "@/components/reviews/ReviewListItem";
import type { Review } from "@/lib/types";
import { COLOR_PALETTES, defaultTheme } from "@/lib/theme";
import {
  GoalsProgress,
  RemindersTab,
  TimerRing,
  TimerTab,
} from "@/components/goals";
import { ProgressRingIcon, TimerRingIcon } from "@/icons";
import Fuse from "fuse.js";
import { useRouter, useSearchParams } from "next/navigation";

type View = "components" | "colors" | "onboarding";
type Section = "buttons" | "inputs" | "prompts" | "planner" | "layout" | "misc";

type Spec = {
  id: string;
  name: string;
  description?: string;
  element: React.ReactNode;
  tags: string[];
  props?: { label: string; value: string }[];
};

const VIEW_TABS: TabItem<View>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
  { key: "onboarding", label: "Onboarding" },
];

const COLOR_SECTIONS = [
  { title: "Aurora", tokens: COLOR_PALETTES.aurora },
  { title: "Neutrals", tokens: COLOR_PALETTES.neutrals },
  { title: "Accents", tokens: COLOR_PALETTES.accents },
];

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

const SPEC_DATA: Record<Section, Spec[]> = {
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
          <Button data-loading="true">Loading</Button>
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
        <div className="flex items-center gap-4">
          <IconButton aria-label="Default">
            <Plus />
          </IconButton>
          <IconButton aria-label="Hover" className="bg-[--hover]">
            <Plus />
          </IconButton>
          <IconButton aria-label="Focus" className="ring-2 ring-[--focus]">
            <Plus />
          </IconButton>
          <IconButton aria-label="Active" className="bg-[--active]">
            <Plus />
          </IconButton>
          <IconButton aria-label="Disabled" disabled>
            <Plus />
          </IconButton>
          <IconButton aria-label="Loading" data-loading="true">
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
      description: "Text input field",
      element: <Input placeholder="Type here" />,
      tags: ["input", "text"],
    },
    {
      id: "input-states",
      name: "Input States",
      description: "State tokens",
      element: (
        <div className="flex flex-col gap-4">
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
      description: "Sample prompts",
      element: <PromptList prompts={demoPrompts} query="" />,
      tags: ["prompts"],
    },
  ],
  planner: [
    {
      id: "goal-list",
      name: "GoalList",
      description: "Editable goal list with tokenized hover shadow",
      element: <GoalListDemo />,
      tags: ["planner"],
    },
    {
      id: "progress",
      name: "Progress",
      description: "Neon gradient bar",
      element: <Progress value={50} />,
      tags: ["progress", "feedback"],
    },
    {
      id: "goals-progress",
      name: "GoalsProgress",
      description: "Radial neon progress",
      element: <GoalsProgress total={5} pct={60} />,
      tags: ["progress", "goals"],
    },
    {
      id: "reminders-tab",
      name: "RemindersTab",
      description: "Reminders tab layout",
      element: <RemindersTab />,
      tags: ["reminders", "planner"],
    },
    {
      id: "timer-tab",
      name: "TimerTab",
      description: "Timer tab layout",
      element: <TimerTab />,
      tags: ["timer", "planner"],
    },
    {
      id: "timer-ring",
      name: "TimerRing",
      description: "Radial timer ring",
      element: <TimerRing pct={75} />,
      tags: ["progress", "timer"],
    },
    {
      id: "progress-ring-icon",
      name: "ProgressRingIcon",
      description: "SVG ring for goals progress",
      element: <ProgressRingIcon pct={60} />,
      tags: ["progress", "icon"],
    },
    {
      id: "timer-ring-icon",
      name: "TimerRingIcon",
      description: "SVG ring for timer",
      element: <TimerRingIcon pct={75} size={200} />,
      tags: ["progress", "icon", "timer"],
    },
    {
      id: "dashboard-card",
      name: "DashboardCard",
      description: "Home dashboard shell",
      element: (
        <DashboardCard title="Demo" cta={{ label: "Action", href: "#" }}>
          <p className="text-sm">Content</p>
        </DashboardCard>
      ),
      tags: ["home", "dashboard"],
    },
  ],
  layout: [
    {
      id: "hero",
      name: "Hero",
      description: "Default Hero layout",
      element: (
        <Hero
          heading="Heading"
          eyebrow="Eyebrow"
          subtitle="Subtitle"
          search={{ value: "", onValueChange: () => {}, round: true }}
          tabs={{
            items: [
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
            ],
            value: "one",
            onChange: () => {},
          }}
        />
      ),
      tags: ["hero", "layout"],
    },
    {
      id: "hero2",
      name: "Hero2",
      description: "Glitch Hero layout",
      element: (
        <Hero2
          heading="Heading"
          eyebrow="Eyebrow"
          subtitle="Subtitle"
          search={{
            value: "",
            onValueChange: () => {},
            round: true,
            disabled: true,
          }}
          tabs={{
            items: [
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
            ],
            value: "one",
            onChange: () => {},
          }}
        />
      ),
      tags: ["hero", "layout"],
    },
  ],
  misc: [
    {
      id: "status",
      name: "Status Examples",
      description: "States and messages",
      element: (
        <div className="space-y-2 text-xs font-medium">
          <p className="text-danger">Error message</p>
          <p className="text-warning">Warning message</p>
          <p className="text-success">Success message</p>
          <p className="text-accent-2">Info message</p>
        </div>
      ),
      tags: ["status"],
    },
    {
      id: "badge",
      name: "Badge",
      element: <Badge>Badge</Badge>,
      tags: ["badge"],
    },
    {
      id: "role-selector",
      name: "RoleSelector",
      element: <RoleSelector value="TOP" onChange={() => {}} />,
      tags: ["control", "segmented"],
    },
    {
      id: "review-list-item",
      name: "ReviewListItem",
      element: <ReviewListItem review={demoReview} />,
      tags: ["review", "tile"],
    },
    {
      id: "theme-picker",
      name: "ThemePicker",
      element: <ThemePickerDemo />,
      tags: ["control", "theme"],
    },
    {
      id: "background-picker",
      name: "BackgroundPicker",
      element: <BackgroundPickerDemo />,
      tags: ["control", "theme"],
    },
    {
      id: "bottom-nav",
      name: "BottomNav",
      element: <BottomNav />,
      tags: ["navigation", "home"],
    },
    {
      id: "card",
      name: "Card",
      description: "Surface container",
      element: <CardDemo />,
      tags: ["card"],
    },
    {
      id: "sheet",
      name: "Sheet",
      description: "Slide-over panel",
      element: <SheetDemo />,
      tags: ["overlay", "sheet"],
    },
    {
      id: "modal",
      name: "Modal",
      description: "Centered overlay",
      element: <ModalDemo />,
      tags: ["overlay", "modal"],
    },
    {
      id: "toast",
      name: "Toast",
      description: "Transient message",
      element: <ToastDemo />,
      tags: ["toast", "feedback"],
    },
  ],
};

function getValidSection(value: string | null): Section {
  return value && value in SPEC_DATA ? (value as Section) : "buttons";
}

function getSectionTabs(): TabItem<Section>[] {
  return (Object.keys(SPEC_DATA) as Section[]).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));
}

function SpecCard({ name, description, element, props }: Spec) {
  return (
    <div className="flex flex-col gap-4 rounded-card r-card-lg border border-[var(--card-hairline)] bg-card p-6 shadow-[0_0_0_1px_var(--neon-soft)]">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-[-0.01em]">{name}</h3>
      </header>
      {description ? (
        <p className="text-sm font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="rounded-card r-card-md bg-background p-4">{element}</div>
      {props ? (
        <ul className="flex flex-wrap gap-3 text-xs">
          {props.map((p) => (
            <li key={p.label} className="flex gap-1">
              <span className="font-medium tracking-[0.02em]">{p.label}</span>
              <span className="text-muted-foreground">{p.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type SwatchProps = { token: string };

function Swatch({ token }: SwatchProps) {
  return (
    <li className="col-span-3 flex flex-col items-center gap-3">
      <div
        className="h-16 w-full rounded-card r-card-md border border-[var(--card-hairline)]"
        style={{ backgroundColor: `hsl(var(--${token}))` }}
      />
      <span className="text-xs font-medium">{token}</span>
    </li>
  );
}

function GradientSwatch() {
  return (
    <li className="col-span-12 md:col-span-6 flex flex-col items-center gap-3">
      <div className="h-16 w-full rounded-card r-card-md bg-gradient-to-r from-primary via-accent to-transparent" />
      <span className="text-xs font-medium">
        from-primary via-accent to-transparent
      </span>
    </li>
  );
}

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

function ComponentsView({ query }: { query: string }) {
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [section, setSection] = React.useState<Section>(() =>
    getValidSection(searchParams.get("section")),
  );
  const sectionTabs = React.useMemo(getSectionTabs, []);

  React.useEffect(() => {
    const sp = new URLSearchParams(paramsString);
    const s = getValidSection(sp.get("section"));
    if (s !== section) setSection(s);
  }, [paramsString, section]);

  React.useEffect(() => {
    const sp = new URLSearchParams(paramsString);
    const current = sp.get("section");
    if (current === section) return;
    sp.set("section", section);
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [section, router, paramsString, startTransition]);

  const fuse = React.useMemo(
    () =>
      new Fuse(SPEC_DATA[section], {
        keys: ["name", "tags", "props.value"],
        threshold: 0.3,
      }),
    [section],
  );

  const specs = React.useMemo(() => {
    if (!query) return SPEC_DATA[section];
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, section]);

  return (
    <div className="space-y-8">
      <TabBar
        items={sectionTabs}
        value={section}
        onValueChange={setSection}
        ariaLabel="Component groups"
        linkPanels={false}
      />
      <ul className="grid grid-cols-12 gap-6">
        {specs.length === 0 ? (
          <li className="col-span-12">
            <Card>
              <CardContent>No results found</CardContent>
            </Card>
          </li>
        ) : (
          specs.map((spec) => (
            <li key={spec.id} className="col-span-12 md:col-span-6">
              <SpecCard {...spec} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ColorsView() {
  return (
    <div className="space-y-8">
      {COLOR_SECTIONS.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <ul className="grid grid-cols-12 gap-6">
            {p.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </SectionCard>
      ))}
      <SectionCard title="Gradients">
        <ul className="grid grid-cols-12 gap-6">
          <GradientSwatch />
        </ul>
      </SectionCard>
    </div>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<p className="p-4 text-sm">Loading...</p>}>
      <PageContent />
    </React.Suspense>
  );
}

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = React.useTransition();
  const viewParam = searchParams.get("view");
  const queryParam = searchParams.get("q");
  const [view, setView] = React.useState<View>(
    () => (viewParam as View) || "components",
  );
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const v = (viewParam as View) || "components";
    if (v !== view) setView(v);
  }, [viewParam, view]);

  React.useEffect(() => {
    const q = queryParam ?? "";
    if (q !== query) setQuery(q);
  }, [queryParam, query]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prompts-query");
      if (stored) setQuery(stored);
    }
  }, []);

  React.useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("view");
    if (current === view) return;
    sp.set("view", view);
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [view, router, searchParams, startTransition]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("prompts-query", query);
    }
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("q") ?? "";
    if (current === query) return;
    if (query) sp.set("q", query);
    else sp.delete("q");
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [query, router, searchParams, startTransition]);

  return (
    <main
      className="page-shell py-6 space-y-6"
      aria-labelledby="prompts-header"
    >
      <Header
        id="prompts-header"
        heading="Prompts Playground"
        subtitle="Explore components and tokens"
        right={<ThemeToggle />}
      />
      <Hero
        topClassName="top-[var(--header-stack)]"
        heading={
          view === "components"
            ? "Components"
            : view === "colors"
              ? "Colors"
              : "Onboarding"
        }
        tabs={{
          items: VIEW_TABS,
          value: view,
          onChange: (k) => setView(k as View),
        }}
        search={{
          id: "playground-search",
          value: query,
          onValueChange: setQuery,
          debounceMs: 300,
          round: true,
          "aria-label": "Search components",
        }}
      />
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div>
            <div
              role="tabpanel"
              id="components-panel"
              aria-labelledby="components-tab"
              hidden={view !== "components"}
              tabIndex={0}
            >
              <ComponentsView query={query} />
            </div>
            <div
              role="tabpanel"
              id="colors-panel"
              aria-labelledby="colors-tab"
              hidden={view !== "colors"}
              tabIndex={0}
            >
              <ColorsView />
            </div>
            <div
              role="tabpanel"
              id="onboarding-panel"
              aria-labelledby="onboarding-tab"
              hidden={view !== "onboarding"}
              tabIndex={0}
            >
              <OnboardingTabs />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <UpdatesList />
        </div>
      </section>
    </main>
  );
}
