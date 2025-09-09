import * as React from "react";
import {
  Header,
  Hero,
  Button,
  Input,
  AnimatedSelect,
} from "@/components/ui";
import Banner from "@/components/chrome/Banner";
import { GoalsProgress } from "@/components/goals";
import {
  RoleSelector,
  NeonIcon,
  ReviewSummaryHeader,
  ReviewSummaryScore,
} from "@/components/reviews";
import {
  SCORE_POOLS,
  scoreIcon,
} from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";

export const FRUIT_ITEMS = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
];

const NEON_ICONS = [
  { kind: "clock", on: true },
  { kind: "brain", on: true },
  { kind: "file", on: false },
] as const;

const DEMO_SCORE = 7;
const { Icon: DemoScoreIcon, cls: demoScoreCls } = scoreIcon(DEMO_SCORE);
const DEMO_SCORE_MSG = SCORE_POOLS[DEMO_SCORE][0];

export default function DemoHeader({
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
        <AnimatedSelect
          label="Fruit"
          items={FRUIT_ITEMS}
          value={fruit}
          onChange={onFruitChange}
        />
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

