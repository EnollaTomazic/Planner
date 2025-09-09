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
import { RoleSelector, NeonIcon, ReviewSummaryHeader, ReviewSummaryScore, ReviewMetadata, ReviewNotesTags, ReviewMarkerEditor, type Result } from "@/components/reviews";
import { ComponentGallery, ColorGallery } from "@/components/prompts";
import { ROLE_OPTIONS, SCORE_POOLS, FOCUS_POOLS, scoreIcon } from "@/components/reviews/reviewData";
import type { Role, Pillar, ReviewMarker } from "@/lib/types";
import { Plus } from "lucide-react";

type View = "components" | "colors";

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

  const [metaResult, setMetaResult] = React.useState<Result>("Win");
  const [metaScore, setMetaScore] = React.useState(5);
  const [metaFocusOn, setMetaFocusOn] = React.useState(false);
  const [metaFocus, setMetaFocus] = React.useState(5);
  const [metaPillars, setMetaPillars] = React.useState<Pillar[]>([]);
  const metaScoreInfo = scoreIcon(metaScore);
  const metaScoreMsg = SCORE_POOLS[metaScore][0];
  const metaFocusMsg = (FOCUS_POOLS[metaFocus] ?? FOCUS_POOLS[5])[0];
  const metaResultRef = React.useRef<HTMLButtonElement>(null);

  const [demoMarkers, setDemoMarkers] = React.useState<ReviewMarker[]>([]);
  const markerTimeRef = React.useRef<HTMLInputElement>(null);
  const [demoMarkerMode, setDemoMarkerMode] = React.useState(true);
  const [demoMarkerTime, setDemoMarkerTime] = React.useState("");

  const [demoNotes, setDemoNotes] = React.useState("");
  const [demoTags, setDemoTags] = React.useState<string[]>([]);

  const demoScore = 7;
  const { Icon: DemoScoreIcon, cls: demoScoreCls } = scoreIcon(demoScore);
  const demoScoreMsg = SCORE_POOLS[demoScore][0];

  return (
    <main className="page-shell py-6">
      <div className="mb-8 space-y-4">
        <Header heading="Header" sticky={false} />
        <Hero heading="Hero" sticky={false} />
        <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
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
        <div className="flex flex-col items-center gap-4">
          <ReviewSummaryHeader title="Demo Review" role={role} result="Win" />
          <ReviewSummaryScore
            score={demoScore}
            msg={demoScoreMsg}
            ScoreIcon={DemoScoreIcon}
            scoreIconCls={demoScoreCls}
          />
        </div>
        <div className="flex justify-center gap-4">
          <NeonIcon kind="clock" on={true} />
          <NeonIcon kind="brain" on={true} />
          <NeonIcon kind="file" on={false} />
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
        <div className="space-y-4">
          <ReviewMetadata
            result={metaResult}
            onChangeResult={setMetaResult}
            score={metaScore}
            onChangeScore={setMetaScore}
            focusOn={metaFocusOn}
            onToggleFocus={setMetaFocusOn}
            focus={metaFocus}
            onChangeFocus={setMetaFocus}
            pillars={metaPillars}
            togglePillar={(p) =>
              setMetaPillars((prev) =>
                prev.includes(p) ? prev.filter((x) => x !== p) : prev.concat(p),
              )
            }
            scoreMsg={metaScoreMsg}
            ScoreIcon={metaScoreInfo.Icon}
            scoreIconCls={metaScoreInfo.cls}
            focusMsg={metaFocusMsg}
            onScoreNext={() => markerTimeRef.current?.focus()}
            resultRef={metaResultRef}
          />
          <ReviewMarkerEditor
            markers={demoMarkers}
            onChange={setDemoMarkers}
            timeRef={markerTimeRef}
            lastMarkerMode={demoMarkerMode}
            setLastMarkerMode={setDemoMarkerMode}
            lastMarkerTime={demoMarkerTime}
            setLastMarkerTime={setDemoMarkerTime}
          />
          <ReviewNotesTags
            notes={demoNotes}
            onNotesChange={setDemoNotes}
            onNotesBlur={() => {}}
            tags={demoTags}
            onTagsChange={setDemoTags}
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

