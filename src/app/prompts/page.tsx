"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  SearchBar,
  TabBar,
  ThemeToggle,
  type TabItem,
} from "@/components/ui";
import UpdatesList from "@/components/prompts/UpdatesList";
import GoalListDemo from "@/components/prompts/GoalListDemo";
import PromptList from "@/components/prompts/PromptList";
import type { PromptWithTitle } from "@/components/prompts/usePrompts";
import { Plus } from "lucide-react";
import { DashboardCard } from "@/components/home";

type View = "components" | "colors";
type Section =
  | "buttons"
  | "iconButton"
  | "inputs"
  | "prompts"
  | "planner"
  | "misc";

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
];

const SECTION_TABS: TabItem<Section>[] = [
  { key: "buttons", label: "Buttons" },
  { key: "iconButton", label: "IconButton" },
  { key: "inputs", label: "Inputs" },
  { key: "prompts", label: "Prompts" },
  { key: "planner", label: "Planner" },
  { key: "misc", label: "Misc" },
];

const AURORA_TOKENS = [
  "bg-auroraG",
  "bg-auroraGLight",
  "bg-auroraP",
  "bg-auroraPLight",
];

const NEUTRAL_TOKENS = [
  "bg-border",
  "bg-input",
  "bg-ring",
  "bg-background",
  "bg-foreground",
  "bg-card",
  "bg-panel",
  "bg-muted",
  "bg-lavDeep",
  "bg-surfaceVhs",
  "bg-surfaceStreak",
];

const ACCENT_TOKENS = [
  "bg-primary",
  "bg-accent",
  "bg-accent-2",
  "bg-glow",
  "bg-ringMuted",
  "bg-danger",
  "bg-warning",
  "bg-success",
];

const demoPrompts: PromptWithTitle[] = [
  {
    id: "p1",
    title: "Demo prompt",
    text: "",
    createdAt: Date.now(),
  },
];

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
  ],
  iconButton: [
    {
      id: "icon-button",
      name: "IconButton",
      description: "Size variants",
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
  ],
  inputs: [
    {
      id: "input",
      name: "Input",
      description: "Text input field",
      element: <Input placeholder="Type here" />,
      tags: ["input", "text"],
    },
  ],
  prompts: [
    {
      id: "prompt-list",
      name: "PromptList",
      description: "Sample prompts",
      element: <PromptList prompts={demoPrompts} />,
      tags: ["prompts"],
    },
  ],
  planner: [
    {
      id: "goal-list",
      name: "GoalList",
      description: "Demo goal list",
      element: <GoalListDemo />,
      tags: ["planner"],
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
  ],
};

function SpecCard({ name, description, element, props }: Spec) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--card-hairline)] bg-card p-6 shadow-[0_0_0_1px_var(--neon-soft)]">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-[-0.01em]">{name}</h3>
      </header>
      {description ? (
        <p className="text-sm font-medium text-muted-foreground">{description}</p>
      ) : null}
      <div className="rounded-xl bg-background p-4">{element}</div>
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
        className="h-16 w-full rounded-xl border border-[var(--card-hairline)]"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <span className="text-xs font-medium">{token}</span>
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
  const [section, setSection] = React.useState<Section>("buttons");
  const specs = React.useMemo(() => {
    const q = query.toLowerCase();
    return SPEC_DATA[section].filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q)),
    );
  }, [section, query]);

  return (
    <div className="space-y-8">
      <TabBar
        items={SECTION_TABS}
        value={section}
        onValueChange={setSection}
        ariaLabel="Component groups"
      />
      <ul className="grid grid-cols-12 gap-6">
        {specs.map((spec) => (
          <li key={spec.id} className="col-span-12 md:col-span-6">
            <SpecCard {...spec} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColorsView() {
  const palettes = [
    { title: "Aurora", tokens: AURORA_TOKENS },
    { title: "Neutrals", tokens: NEUTRAL_TOKENS },
    { title: "Accents", tokens: ACCENT_TOKENS },
  ];
  return (
    <div className="space-y-8">
      {palettes.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <ul className="grid grid-cols-12 gap-6">
            {p.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}

export default function Page() {
  const [view, setView] = React.useState<View>("components");
  const [query, setQuery] = React.useState("");

  return (
    <main className="mx-auto max-w-screen-xl grid grid-cols-12 gap-x-6 px-6 py-8">
      <header className="col-span-12 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">Prompts Playground</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore components and tokens
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="col-span-12">
        <SearchBar value={query} onValueChange={setQuery} />
      </div>
      <div className="col-span-12">
        <UpdatesList />
      </div>
      <div className="col-span-12">
        <TabBar
          items={VIEW_TABS}
          value={view}
          onValueChange={setView}
          ariaLabel="Playground views"
        />
      </div>
      <div className="col-span-12">
        {view === "components" ? (
          <ComponentsView query={query} />
        ) : (
          <ColorsView />
        )}
      </div>
    </main>
  );
}

