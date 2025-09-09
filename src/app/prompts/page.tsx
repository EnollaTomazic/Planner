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
import { RoleSelector, NeonIcon, ReviewSummaryHeader, ReviewSummaryScore } from "@/components/reviews";
import { ComponentGallery, ColorGallery } from "@/components/prompts";
import { ROLE_OPTIONS, SCORE_POOLS, scoreIcon } from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";
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

export default function Page() {
  const viewTabs: TabItem<View>[] = [
    { key: "components", label: "Components" },
    { key: "colors", label: "Colors" },
  ];

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
          <RoleSelector value={role} onChange={setRole} />
        </div>
        <div className="flex justify-center">
          <AnimatedSelect
            label="Fruit"
            items={fruitItems}
            value={fruit}
            onChange={setFruit}
          />
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
        <p className="text-xs text-danger">Example error message</p>
      </ShowcaseSection>

      <ShowcaseSection title="Updates">
        <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          <li>
            Global styles are now modularized into <code>animations.css</code>,
            <code>overlays.css</code>, and <code>utilities.css</code>.
          </li>
          <li>
            Control height token <code>--control-h</code> now snaps to 44px to
            align with the 4px spacing grid.
          </li>
          <li>
            Buttons now default to the 40px <code>md</code> size and follow a
            36/40/44px scale.
          </li>
          <li>
            WeekPicker scrolls horizontally with snap points, showing 2–3 days
            at a time on smaller screens.
          </li>
          <li>Review status dots blink to highlight wins and losses.</li>
          <li>
            Hero dividers now use <code>var(--space-4)</code> top padding and
            tokenized side offsets via <code>var(--space-2)</code>.
          </li>
          <li>IconButton adds a compact <code>xs</code> size.</li>
          <li>DurationSelector active state uses accent color tokens.</li>
        </ul>
      </ShowcaseSection>

      <ShowcaseSection title="Buttons">
        <div className="flex flex-wrap gap-2">
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
      </ShowcaseSection>

      <ShowcaseSection title="Icon Buttons">
        <div className="flex gap-2">
          <IconButton size="xs" aria-label="Add item xs" title="Add item xs">
            <Plus size={16} aria-hidden />
          </IconButton>
          <IconButton aria-label="Add item" title="Add item">
            <Plus size={16} aria-hidden />
          </IconButton>
          <IconButton
            variant="glow"
            aria-label="Add item glow"
            title="Add item glow"
          >
            <Plus size={16} aria-hidden />
          </IconButton>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Gallery">
        <div className="mb-4">
          <TabBar
            items={viewTabs}
            value={view}
            onValueChange={(k) => setView(k)}
            ariaLabel="Prompts gallery view"
          />
        </div>
        {view === "components" ? <ComponentGallery /> : <ColorGallery />}
      </ShowcaseSection>
    </main>
  );
}

