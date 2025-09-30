import * as React from "react";
import { Header, Hero, Button, Input, Select } from "@/components/ui";
import { Star } from "lucide-react";
import Banner from "@/components/chrome/Banner";
import { GoalsProgress } from "@/components/goals";
import {
  RoleSelector,
  NeonIcon,
  ReviewSummaryHeader,
  ReviewSummaryScore,
} from "@/components/reviews";
import { SCORE_POOLS, scoreIcon } from "@/components/reviews/reviewData";
import { FRUIT_ITEMS, NEON_ICONS } from "./demoData";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import segmentedButtonStyles from "@/components/ui/primitives/SegmentedButton.module.css";

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
    <div className="mb-[var(--space-6)] space-y-[var(--space-4)]">
      <Header
        heading="Header"
        sticky={false}
        icon={<Star className="opacity-80" />}
      />
      <Hero heading="Hero" sticky={false} topClassName="top-0" />
      <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
      <div className="flex justify-center">
        <GoalsProgress total={5} pct={60} />
      </div>
      <div className="flex justify-center">
        <RoleSelector value={role} onChange={onRoleChange} />
      </div>
      <div className="flex justify-center">
        <Select
          variant="animated"
          label="Fruit"
          items={FRUIT_ITEMS}
          value={fruit}
          onChange={onFruitChange}
        />
      </div>
      <div className="flex flex-col items-center gap-[var(--space-4)]">
        <ReviewSummaryHeader title="Demo Review" role={role} result="Win" />
        <ReviewSummaryScore
          score={DEMO_SCORE}
          msg={DEMO_SCORE_MSG}
          ScoreIcon={DemoScoreIcon}
          scoreIconCls={demoScoreCls}
        />
      </div>
      <div className="flex justify-center gap-[var(--space-4)]">
        {NEON_ICONS.map(({ kind, on }) => (
          <NeonIcon key={kind} kind={kind} on={on} />
        ))}
      </div>
      <div className="flex justify-center">
        <Input
          aria-label="Timer demo"
          defaultValue="25:00"
          className={cn(
            segmentedButtonStyles.root,
            segmentedButtonStyles.glitch,
            "glitch-wrapper group/glitch w-[5ch]",
          )}
          data-depth="raised"
          glitch
          inputClassName="text-center"
          type="text"
        />
      </div>
    </div>
  );
}
