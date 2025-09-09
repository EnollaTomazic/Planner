"use client";

import * as React from "react";
import {
  TabBar,
  Header,
  Hero,
  Button,
  IconButton,
  type TabItem,
  Input,
  AnimatedSelect,
} from "@/components/ui";
import Banner from "@/components/chrome/Banner";
import { GoalsProgress } from "@/components/goals";
<<<<<<< HEAD
import {
  RoleSelector,
  NeonIcon,
  ReviewSummaryHeader,
  ReviewSummaryScore,
  ReviewEditor,
} from "@/components/reviews";
=======
import { RoleSelector, NeonIcon, ReviewSummaryHeader, ReviewSummaryScore } from "@/components/reviews";
>>>>>>> main
import { ComponentGallery, ColorGallery } from "@/components/prompts";
import { ROLE_OPTIONS, SCORE_POOLS, scoreIcon } from "@/components/reviews/reviewData";
import type { Role, Review } from "@/lib/types";
import { Plus } from "lucide-react";

type View = "components" | "colors";

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const VIEW_TABS: TabItem<View>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
];

<<<<<<< HEAD
const FRUIT_ITEMS = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
];
<<<<<<< HEAD

const NEON_ICONS = [
  { kind: "clock", on: true },
  { kind: "brain", on: true },
  { kind: "file", on: false },
] as const;

const UPDATES: React.ReactNode[] = [
  <>
    Global styles are now modularized into <code>animations.css</code>,<code>overlays.css</code>, and
    <code>utilities.css</code>.
  </>,
  <>
    Control height token <code>--control-h</code> now snaps to 44px to align with the 4px spacing grid.
  </>,
  <>
    Buttons now default to the 40px <code>md</code> size and follow a 36/40/44px scale.
  </>,
  <>
    WeekPicker scrolls horizontally with snap points, showing 2–3 days at a time on smaller screens.
  </>,
  <>Review status dots blink to highlight wins and losses.</>,
  <>
    Hero dividers now use <code>var(--space-4)</code> top padding and tokenized side offsets via <code>var(--space-2)</code>.
  </>,
  <>
    IconButton adds a compact <code>xs</code> size.
  </>,
  <>DurationSelector active state uses accent color tokens.</>,
  <>
    Color gallery groups tokens into Aurora, Neutrals, and Accents palettes with tabs.
  </>,
];

const DEMO_SCORE = 7;
const { Icon: DemoScoreIcon, cls: demoScoreCls } = scoreIcon(DEMO_SCORE);
const DEMO_SCORE_MSG = SCORE_POOLS[DEMO_SCORE][0];
const DEMO_REVIEW: Review = { id: "demo-review", title: "Demo Review", createdAt: Date.now(), notes: "", tags: [], pillars: [], score: 5, result: "Win" };

function DemoHeader({
  role,
  onRoleChange,
  fruit,
  onFruitChange,
}: {
  role: Role;
  onRoleChange: (r: Role) => void;
  fruit: string;
  onFruitChange: (f: string) => void;
}) {
  return (
    <div className="mb-8 space-y-4">
      <Header heading="Header" sticky={false} />
      <Hero heading="Hero" sticky={false} />
      <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
      <div className="flex justify-center">
        <GoalsProgress total={5} pct={60} />
      </div>
      <div className="flex justify-center">
        <RoleSelector value={role} onChange={onRoleChange} />
      </div>
      <div className="flex justify-center">
        <AnimatedSelect label="Fruit" items={FRUIT_ITEMS} value={fruit} onChange={onFruitChange} />
      </div>
      <div className="flex flex-col items-center gap-4">
        <ReviewSummaryHeader title="Demo Review" role={role} result="Win" />
        <ReviewSummaryScore
          score={DEMO_SCORE}
          msg={DEMO_SCORE_MSG}
          ScoreIcon={DemoScoreIcon}
          scoreIconCls={demoScoreCls}
        />
      </div>
      <div className="flex justify-center gap-4">
        {NEON_ICONS.map(({ kind, on }) => (
          <NeonIcon key={kind} kind={kind} on={on} />
        ))}
      </div>
      <div className="flex justify-center">
        <Input
          aria-label="Timer demo"
          defaultValue="25:00"
          className="btn-like-segmented btn-glitch w-[5ch]"
          inputClassName="text-center"
          type="text"
        />
      </div>
    </div>
  );
}

const UpdatesList = () => (
  <ul className="mb-4 space-y-4">
    {UPDATES.map((content, i) => (
      <li key={i} className="text-sm text-muted-foreground">
        {content}
      </li>
    ))}
  </ul>
);

const ButtonShowcase = () => (
  <div className="mb-8 flex flex-wrap gap-2">
    <Button tone="primary">Primary tone</Button>
    <Button tone="accent">Accent tone</Button>
    <Button tone="info" variant="ghost">
      Info ghost
    </Button>
    <Button tone="danger" variant="primary">
      Danger primary
    </Button>
    <Button disabled>Disabled</Button>
  </div>
);

const IconButtonShowcase = () => (
  <div className="mb-8 flex gap-2">
    <IconButton size="xs" aria-label="Add item xs" title="Add item xs">
      <Plus size={16} aria-hidden />
    </IconButton>
    <IconButton aria-label="Add item" title="Add item">
      <Plus size={16} aria-hidden />
    </IconButton>
    <IconButton variant="glow" aria-label="Add item glow" title="Add item glow">
      <Plus size={16} aria-hidden />
    </IconButton>
  </div>
);

export default function Page() {
=======
=======
>>>>>>> main
  const [view, setView] = React.useState<View>("components");
  const [role, setRole] = React.useState<Role>(ROLE_OPTIONS[0].value);
  const fruitItems = [
    { value: "apple", label: "Apple" },
    { value: "orange", label: "Orange" },
  ];
  const [fruit, setFruit] = React.useState(fruitItems[0].value);

  const demoScore = 7;
  const { Icon: DemoScoreIcon, cls: demoScoreCls } = scoreIcon(demoScore);
  const demoScoreMsg = SCORE_POOLS[demoScore][0];

  return (
    <main className="page-shell py-6">
<<<<<<< HEAD
      <DemoHeader
        role={role}
        onRoleChange={setRole}
        fruit={fruit}
        onFruitChange={setFruit}
      />
      <UpdatesList />
      <ButtonShowcase />
      <IconButtonShowcase />
      <ReviewEditor review={DEMO_REVIEW} />
      <HomePage />
=======
      <ShowcaseSection title="Chrome">
        <Header heading="Header" sticky={false} />
        <Hero heading="Hero" sticky={false} />
        <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
      </ShowcaseSection>

      <ShowcaseSection title="Progress & Selectors">
        <div className="flex justify-center">
          <GoalsProgress total={5} pct={60} />
        </div>
        <div className="flex justify-center">
          <GoalSlot
            goal={demoGoal}
            onEdit={(_, t) => setDemoGoal((g) => ({ ...g, title: t }))}
          />
        </div>
        <div className="flex justify-center">
          <RoleSelector value={role} onChange={setRole} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Review Summary">
        <div className="flex flex-col items-center gap-4">
          <ReviewSummaryHeader title="Demo Review" role={role} result="Win" />
          <ReviewSummaryScore
            score={demoScore}
            msg={demoScoreMsg}
            ScoreIcon={DemoScoreIcon}
            scoreIconCls={demoScoreCls}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Neon Icons">
        <div className="flex justify-center gap-4">
          <NeonIcon kind="clock" on />
          <NeonIcon kind="brain" on />
          <NeonIcon kind="file" on={false} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Input">
        <div className="flex justify-center">
          <Input
            aria-label="Timer demo"
            defaultValue="25:00"
            className="btn-like-segmented btn-glitch w-[5ch]"
            inputClassName="text-center"
            type="text"
          />
        </div>
      </div>
      <ul className="mb-4 space-y-4">
        <li className="text-sm text-muted-foreground">
          Global styles are now modularized into <code>animations.css</code>,
          <code>overlays.css</code>, and <code>utilities.css</code>.
        </li>
        <li className="text-sm text-muted-foreground">
          Control height token <code>--control-h</code> now snaps to 44px to
          align with the 4px spacing grid.
        </li>
        <li className="text-sm text-muted-foreground">
          Buttons now default to the 40px <code>md</code> size and follow a
          36/40/44px scale.
        </li>
        <li className="text-sm text-muted-foreground">
          WeekPicker scrolls horizontally with snap points, showing 2–3 days at
          a time on smaller screens.
        </li>
        <li className="text-sm text-muted-foreground">
          Review status dots blink to highlight wins and losses.
        </li>
        <li className="text-sm text-muted-foreground">
          Hero dividers now use <code>var(--space-4)</code> top padding and
          tokenized side offsets via <code>var(--space-2)</code>.
        </li>
        <li className="text-sm text-muted-foreground">
          IconButton adds a compact <code>xs</code> size.
        </li>
        <li className="text-sm text-muted-foreground">
          DurationSelector active state uses accent color tokens.
        </li>
        <li className="text-sm text-muted-foreground">
          Color gallery groups tokens into Aurora, Neutrals, and Accents
          palettes with tabs.
        </li>
      </ul>
      <div className="mb-8 flex flex-wrap gap-2">
        <Button tone="primary">Primary tone</Button>
        <Button tone="accent">Accent tone</Button>
        <Button tone="info" variant="ghost">
          Info ghost
        </Button>
        <Button tone="danger" variant="primary">
          Danger primary
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="mb-8 flex gap-2">
        <IconButton size="xs" aria-label="Add item xs" title="Add item xs">
          <Plus size={16} aria-hidden />
        </IconButton>
        <IconButton aria-label="Add item" title="Add item">
          <Plus size={16} aria-hidden />
        </IconButton>
        <IconButton variant="glow" aria-label="Add item glow" title="Add item glow">
          <Plus size={16} aria-hidden />
        </IconButton>
      </div>
>>>>>>> main
      <p className="mb-4 text-xs text-danger">Example error message</p>
      <div className="mb-8">
        <TabBar
          items={viewTabs}
          value={view}
          onValueChange={(k) => setView(k)}
          ariaLabel="Prompts gallery view"
        />
      </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}

