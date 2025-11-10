// src/components/team/Builder.tsx
"use client";
import "./style.css";

import * as React from "react";
import { ArrowLeftRight, Copy, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { Textarea } from "@/components/ui/primitives/Textarea";
import { usePersistentState } from "@/lib/db";
import { copyText } from "@/lib/clipboard";

/* ───────────────── types & constants ───────────────── */

export type Team = {
  top: string;
  jungle: string;
  mid: string;
  bot: string;
  support: string;
  notes?: string;
};
export type TeamState = { allies: Team; enemies: Team };
export type LaneKey = Exclude<keyof Team, "notes">;
type Side = "allies" | "enemies";

type TeamCoverage = {
  filledCount: number;
  openLanes: string[];
};

type LaneSummary = {
  key: LaneKey;
  label: string;
  value: string;
};

export const TEAM_KEY = "team_comp_v1";
const EMPTY_TEAM: Team = {
  top: "",
  jungle: "",
  mid: "",
  bot: "",
  support: "",
  notes: "",
};
export const LANES: { key: LaneKey; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "jungle", label: "Jungle" },
  { key: "mid", label: "Mid" },
  { key: "bot", label: "Bot" },
  { key: "support", label: "Support" },
];

function createChampionSet(values: string[]) {
  return new Set(values.map((name) => name.toLowerCase()));
}

const ENCHANTER_SUPPORTS = createChampionSet([
  "bard",
  "janna",
  "karma",
  "lulu",
  "milio",
  "nami",
  "renata glasc",
  "seraphine",
  "sona",
  "soraka",
  "taric",
  "yuumi",
]);
const HYPER_CARRY_MARKSMEN = createChampionSet([
  "aphelios",
  "jinx",
  "kai'sa",
  "kog'maw",
  "samira",
  "smolder",
  "tristana",
  "twitch",
  "zeri",
]);
const PRIMARY_ENGAGE_INITIATORS = createChampionSet([
  "alistar",
  "amumu",
  "camille",
  "diana",
  "galio",
  "hecarim",
  "jarvan iv",
  "kennen",
  "leona",
  "malphite",
  "maokai",
  "nautilus",
  "ornn",
  "rakan",
  "rell",
  "sejuani",
  "sion",
  "vi",
  "volibear",
  "wukong",
  "zac",
]);
const AIRBORNE_SETUPS = createChampionSet([
  "alistar",
  "cho'gath",
  "galio",
  "jarvan iv",
  "malphite",
  "maokai",
  "nautilus",
  "ornn",
  "rakan",
  "rell",
  "sejuani",
  "sion",
  "wukong",
  "zac",
]);
const WOMBO_SCALERS = createChampionSet(["diana", "samira", "yasuo", "yone"]);
const SIEGE_POKE_SPECIALISTS = createChampionSet([
  "ashe",
  "caitlyn",
  "corki",
  "jayce",
  "lux",
  "nidalee",
  "varus",
  "vel'koz",
  "xerath",
  "ziggs",
  "zoe",
]);
const DISENGAGE_TOOLS = createChampionSet([
  "braum",
  "gragas",
  "janna",
  "lulu",
  "milio",
  "poppy",
  "renata glasc",
  "tahm kench",
  "trundle",
]);
const DIVE_ASSASSINS = createChampionSet([
  "akali",
  "camille",
  "diana",
  "ekko",
  "fizz",
  "hecarim",
  "jarvan iv",
  "kha'zix",
  "lee sin",
  "nocturne",
  "rengar",
  "vi",
  "wukong",
  "xin zhao",
  "zed",
]);

export function createInitialTeamState(): TeamState {
  return {
    allies: { ...EMPTY_TEAM },
    enemies: { ...EMPTY_TEAM },
  };
}

export function useTeamBuilderState() {
  return usePersistentState<TeamState>(TEAM_KEY, createInitialTeamState());
}

/* ───────────────── helpers ───────────────── */

function teamToLines(t: Team) {
  return [
    `Top: ${t.top || "-"}`,
    `Jungle: ${t.jungle || "-"}`,
    `Mid: ${t.mid || "-"}`,
    `Bot: ${t.bot || "-"}`,
    `Support: ${t.support || "-"}`,
    ...(t.notes?.trim() ? ["", `Notes: ${t.notes.trim()}`] : []),
  ].join("\n");
}

function stringify(s: TeamState) {
  const left = teamToLines(s.allies);
  const right = teamToLines(s.enemies);
  return [
    "Allies",
    "------",
    left,
    "",
    "Enemies",
    "-------",
    right,
    "",
    "# 13 League Review · Team Builder",
  ].join("\n");
}

function normalizeChampionName(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function computeTeamCoverage(team: Team): TeamCoverage {
  const coverage: TeamCoverage = {
    filledCount: 0,
    openLanes: [],
  };

  for (const lane of LANES) {
    const value = normalizeChampionName(team[lane.key]);
    if (value.length > 0) {
      coverage.filledCount += 1;
    } else {
      coverage.openLanes.push(lane.label);
    }
  }

  return coverage;
}

function getLaneValues(team: Team): LaneSummary[] {
  return LANES.map((lane) => ({
    key: lane.key,
    label: lane.label,
    value: normalizeChampionName(team[lane.key]),
  }));
}

function formatLaneList(lanes: string[]) {
  if (lanes.length === 0) return "";
  if (lanes.length === 1) return lanes[0];
  if (lanes.length === 2) return `${lanes[0]} and ${lanes[1]}`;
  const last = lanes[lanes.length - 1];
  return `${lanes.slice(0, -1).join(", ")}, and ${last}`;
}

function formatChampionName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Unknown";
}

function computeSynergyInsights(team: Team) {
  const picks = getLaneValues(team).filter((lane) => lane.value.length > 0);
  if (picks.length === 0) {
    return ["Lock in champions to surface synergy callouts."];
  }

  const insights = new Set<string>();

  if (picks.length === 5) {
    insights.add("All five lanes locked—review engage, peel, and scaling distribution.");
  } else if (picks.length >= 3) {
    insights.add(
      `${picks.length}/5 lanes locked—core identity emerging. Define remaining picks to cement the win condition.`,
    );
  } else {
    insights.add(
      `${picks.length}/5 lanes locked—keep options flexible before anchoring the composition.`,
    );
  }

  const duplicates = new Map<string, string[]>();
  for (const pick of picks) {
    const key = pick.value.toLowerCase();
    const lanes = duplicates.get(key);
    if (lanes) {
      lanes.push(pick.label);
    } else {
      duplicates.set(key, [pick.label]);
    }
  }

  for (const [champKey, lanes] of duplicates) {
    if (lanes.length > 1) {
      const original = picks.find((pick) => pick.value.toLowerCase() === champKey)?.value ?? champKey;
      insights.add(
        `${formatChampionName(original)} flexed across ${formatLaneList(lanes)}—call priority order before lock-in.`,
      );
    }
  }

  const botPick = picks.find((pick) => pick.key === "bot");
  const supportPick = picks.find((pick) => pick.key === "support");
  const hasEnchanterSupport = Boolean(
    supportPick && ENCHANTER_SUPPORTS.has(supportPick.value.toLowerCase()),
  );
  const hasHyperCarry = Boolean(
    botPick && HYPER_CARRY_MARKSMEN.has(botPick.value.toLowerCase()),
  );

  if (
    botPick &&
    supportPick &&
    hasHyperCarry &&
    hasEnchanterSupport
  ) {
    insights.add(
      "Bot lane hypercarry + enchanter online—track Exhaust/Cleanse timers to protect scaling fights.",
    );
  }

  if (hasEnchanterSupport && !hasHyperCarry) {
    insights.add(
      "Enchanter drafted without a scaling carry—pair a hyper threat before revealing too much of the plan.",
    );
  }

  const engageCount = picks.filter((pick) => PRIMARY_ENGAGE_INITIATORS.has(pick.value.toLowerCase())).length;
  if (engageCount >= 2) {
    insights.add("Layered engage tools available—sync ultimates for decisive collapses.");
  }

  const pokeCount = picks.filter((pick) => SIEGE_POKE_SPECIALISTS.has(pick.value.toLowerCase())).length;
  if (pokeCount >= 2) {
    insights.add("Double poke threats detected—set up vision denial and slow objective sieges.");
  }

  const womboCarries = picks.filter((pick) => WOMBO_SCALERS.has(pick.value.toLowerCase()));
  const knockupPartners = picks.filter((pick) => AIRBORNE_SETUPS.has(pick.value.toLowerCase()));
  if (womboCarries.length > 0 && knockupPartners.length > 0) {
    const hasDistinctPair = womboCarries.some((carry) =>
      knockupPartners.some(
        (partner) => partner.value.toLowerCase() !== carry.value.toLowerCase(),
      ),
    );
    if (hasDistinctPair) {
      insights.add(
        "Knock-up setup paired with wombo finisher—call layered CC chains and ult timing in reviews.",
      );
    }
  }

  const diveThreats = picks.filter((pick) => DIVE_ASSASSINS.has(pick.value.toLowerCase())).length;
  if (diveThreats >= 2 && engageCount >= 1) {
    insights.add("Multiple dive angles ready—plan flank wards and vision sweeps before objectives.");
  }

  return Array.from(insights);
}

function computeCounterInsights(allies: Team, enemies: Team) {
  const allyLanes = getLaneValues(allies);
  const enemyLanes = getLaneValues(enemies);
  const insights = new Set<string>();

  let enemyDiveCount = 0;
  let allyDisengage: string | null = null;
  let enemyHyperCarry: string | null = null;
  let allyHyperCarry: string | null = null;
  let allyEnchanter: string | null = null;
  let enemyEnchanter: string | null = null;
  let allyDiveThreats = 0;

  for (const lane of enemyLanes) {
    if (lane.value && PRIMARY_ENGAGE_INITIATORS.has(lane.value.toLowerCase())) {
      enemyDiveCount += 1;
    }
    if (!enemyHyperCarry && HYPER_CARRY_MARKSMEN.has(lane.value.toLowerCase())) {
      enemyHyperCarry = lane.value;
    }
    if (!enemyEnchanter && ENCHANTER_SUPPORTS.has(lane.value.toLowerCase())) {
      enemyEnchanter = lane.value;
    }
  }

  for (const lane of allyLanes) {
    if (!allyDisengage && DISENGAGE_TOOLS.has(lane.value.toLowerCase())) {
      allyDisengage = lane.value;
    }
    if (!allyHyperCarry && HYPER_CARRY_MARKSMEN.has(lane.value.toLowerCase())) {
      allyHyperCarry = lane.value;
    }
    if (!allyEnchanter && ENCHANTER_SUPPORTS.has(lane.value.toLowerCase())) {
      allyEnchanter = lane.value;
    }
    if (DIVE_ASSASSINS.has(lane.value.toLowerCase())) {
      allyDiveThreats += 1;
    }
  }

  for (const lane of LANES) {
    const ally = allyLanes.find((item) => item.key === lane.key);
    const enemy = enemyLanes.find((item) => item.key === lane.key);
    const allyValue = ally?.value ?? "";
    const enemyValue = enemy?.value ?? "";

    if (!allyValue && !enemyValue) continue;

    if (allyValue && enemyValue) {
      if (allyValue.toLowerCase() === enemyValue.toLowerCase()) {
        insights.add(`${lane.label}: Mirror on ${formatChampionName(allyValue)}—prep micro matchup notes.`);
      } else {
        insights.add(
          `${lane.label}: ${formatChampionName(allyValue)} vs ${formatChampionName(enemyValue)}—plan wave control and key spike windows.`,
        );
      }
    } else if (allyValue) {
      insights.add(
        `${lane.label}: ${formatChampionName(allyValue)} locked—hold counter-ban leverage until the enemy reveals.`,
      );
    } else if (enemyValue) {
      insights.add(
        `${lane.label}: Enemy drafted ${formatChampionName(enemyValue)}—line up comfort counters or deny follow-up picks.`,
      );
    }
  }

  if (enemyDiveCount >= 2 && !allyDisengage) {
    insights.add("Enemy draft leans on heavy engage—consider peel or disengage tools.");
  } else if (enemyDiveCount >= 2 && allyDisengage) {
    insights.add(
      `${formatChampionName(allyDisengage)} brings disengage vs dive—coordinate cooldown tracking around major engages.`,
    );
  }

  if (enemyHyperCarry && allyDiveThreats >= 2) {
    insights.add(
      `${formatChampionName(enemyHyperCarry)} identified as a scaling threat—double dive options can punish immobile carries.`,
    );
  }

  if (enemyHyperCarry && !allyDiveThreats && !allyEnchanter) {
    insights.add(
      `${formatChampionName(enemyHyperCarry)} unchecked—secure burst or peel tools before late-game fights.`,
    );
  }

  if (allyHyperCarry && enemyEnchanter && !allyDisengage) {
    insights.add(
      `${formatChampionName(enemyEnchanter)} protects their carry—prep anti-shield tools or flanks to break the duo.`,
    );
  }

  if (insights.size === 0) {
    insights.add("Add champions on either side to surface matchup reads.");
  }

  return Array.from(insights);
}

function createCoverageSummary(prefix: string, coverage: TeamCoverage) {
  const open = coverage.openLanes;
  const openText = open.length > 0 ? `Open: ${formatLaneList(open)}.` : "All lanes drafted.";
  return `${prefix}: ${coverage.filledCount}/5 lanes locked. ${openText}`;
}

/* ───────────────── component ───────────────── */

export type BuilderHandle = {
  swapSides: () => void;
  copyAll: () => void;
};

type BuilderProps = {
  editing?: boolean;
  state?: TeamState;
  onStateChange?: React.Dispatch<React.SetStateAction<TeamState>>;
};

export const Builder = React.forwardRef<BuilderHandle, BuilderProps>(
  function Builder({ editing, state: providedState, onStateChange }: BuilderProps, ref) {
    void editing;
    const [internalState, setInternalState] = useTeamBuilderState();
    const state = providedState ?? internalState;
    const setState = onStateChange ?? setInternalState;

    const laneCoverage = React.useMemo(() => {
      return {
        allies: computeTeamCoverage(state.allies),
        enemies: computeTeamCoverage(state.enemies),
      };
    }, [state]);

    const synergyInsights = React.useMemo(
      () => computeSynergyInsights(state.allies),
      [state.allies],
    );

    const counterInsights = React.useMemo(
      () => computeCounterInsights(state.allies, state.enemies),
      [state.allies, state.enemies],
    );

    const setLane = React.useCallback(
      (side: Side, lane: LaneKey, value: string) => {
        const trimmedValue = value.trim();
        setState((prev) => ({
          ...prev,
          [side]: { ...prev[side], [lane]: trimmedValue },
        }));
      },
      [setState],
    );

    const setNotes = React.useCallback(
      (side: Side, value: string) => {
        setState((prev) => ({
          ...prev,
          [side]: { ...prev[side], notes: value },
        }));
      },
      [setState],
    );

    const swapSides = React.useCallback(() => {
      setState((prev) => ({
        allies: { ...prev.enemies },
        enemies: { ...prev.allies },
      }));
    }, [setState]);

    const copy = React.useCallback(
      async (selection: "all" | "allies" | "enemies") => {
        const text =
          selection === "all"
            ? stringify(state)
            : stringify({
                allies: selection === "allies" ? state.allies : EMPTY_TEAM,
                enemies: selection === "enemies" ? state.enemies : EMPTY_TEAM,
              });

        await copyText(text);
      },
      [state],
    );

    const handleCopyAll = React.useCallback(() => {
      void copy("all");
    }, [copy]);

    const handleCopyAllies = React.useCallback(() => {
      void copy("allies");
    }, [copy]);

    const handleCopyEnemies = React.useCallback(() => {
      void copy("enemies");
    }, [copy]);

    React.useImperativeHandle(
      ref,
      () => ({
        swapSides,
        copyAll: handleCopyAll,
      }),
      [handleCopyAll, swapSides],
    );

    const laneCoverageItems = React.useMemo(
      () => [
        createCoverageSummary("Allies", laneCoverage.allies),
        createCoverageSummary("Enemies", laneCoverage.enemies),
      ],
      [laneCoverage],
    );

    return (
      <div data-scope="team" className="w-full mt-[var(--space-6)]">
        <section className="rounded-card r-card-lg glitch-card text-card-foreground relative overflow-hidden flex flex-col">
          <div className="p-[var(--space-5)] flex flex-col gap-[var(--space-5)]">
            <header className="flex flex-wrap items-center gap-[var(--space-3)]">
              <div className="grid grid-cols-2 gap-[var(--space-4)] text-label uppercase tracking-[0.12em] text-muted-foreground flex-1">
                <div className="flex items-center gap-[var(--space-2)]">
                  <span className="glitch-title glitch-flicker" data-text="Allies">
                    Allies
                  </span>
                  <span className="pill pill-compact text-label font-medium tracking-[0.02em] uppercase">
                    {laneCoverage.allies.filledCount}/5 filled
                  </span>
                </div>
                <div className="flex items-center gap-[var(--space-2)] justify-end">
                  <span className="glitch-title glitch-flicker" data-text="Enemies">
                    Enemies
                  </span>
                  <span className="pill pill-compact text-label font-medium tracking-[0.02em] uppercase">
                    {laneCoverage.enemies.filledCount}/5 filled
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <Button
                  size="sm"
                  variant="quiet"
                  type="button"
                  onClick={swapSides}
                  className="min-w-[unset]"
                >
                  <ArrowLeftRight className="size-[var(--space-4)]" /> Swap sides
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  type="button"
                  onClick={handleCopyAllies}
                  className="min-w-[unset]"
                >
                  <Copy className="size-[var(--space-4)]" /> Copy Allies
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  type="button"
                  onClick={handleCopyEnemies}
                  className="min-w-[unset]"
                >
                  <Copy className="size-[var(--space-4)]" /> Copy Enemies
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  type="button"
                  onClick={handleCopyAll}
                  className="min-w-[unset]"
                >
                  <Copy className="size-[var(--space-4)]" /> Copy Both
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
              {LANES.flatMap(({ key, label }) => [
                (
                  <ChampionSelect
                    key={`allies-${key}`}
                    id={`allies-${key}`}
                    laneLabel={label}
                    sideLabel="Allies"
                    value={state.allies[key] as string}
                    onChange={(value) => setLane("allies", key, value)}
                  />
                ),
                (
                  <ChampionSelect
                    key={`enemies-${key}`}
                    id={`enemies-${key}`}
                    laneLabel={label}
                    sideLabel="Enemies"
                    value={state.enemies[key] as string}
                    onChange={(value) => setLane("enemies", key, value)}
                  />
                ),
              ])}
            </div>
          </div>

          <footer className="mt-auto sticky bottom-0 border-t border-card-hairline-65 bg-card/90 backdrop-blur-md">
            <div className="p-[var(--space-5)] flex flex-col gap-[var(--space-4)]">
              <div className="grid gap-[var(--space-4)] md:grid-cols-3">
                <SummaryBlock title="Lane coverage" items={laneCoverageItems} />
                <SummaryBlock title="Synergy read" items={synergyInsights} />
                <SummaryBlock title="Counter scouting" items={counterInsights} />
              </div>

              <div className="grid gap-[var(--space-4)] md:grid-cols-2">
                <NotesField
                  id="allies-notes"
                  label="Allies notes"
                  value={state.allies.notes ?? ""}
                  onChange={(event) => setNotes("allies", event.currentTarget.value)}
                />
                <NotesField
                  id="enemies-notes"
                  label="Enemies notes"
                  value={state.enemies.notes ?? ""}
                  onChange={(event) => setNotes("enemies", event.currentTarget.value)}
                />
              </div>
            </div>
          </footer>
        </section>
      </div>
    );
  },
);

/* ───────────────── subcomponents ───────────────── */

type ChampionSelectProps = {
  id: string;
  laneLabel: string;
  sideLabel: string;
  value: string;
  onChange: (value: string) => void;
};

function ChampionSelect({ id, laneLabel, sideLabel, value, onChange }: ChampionSelectProps) {
  return (
    <label className="flex flex-col gap-[var(--space-2)]">
      <span className="flex items-center justify-between text-label uppercase tracking-[0.08em] text-muted-foreground">
        {laneLabel}
        <span className="text-foreground/65 text-[0.7rem]">{sideLabel}</span>
      </span>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={`Lock ${laneLabel}`}
        aria-label={`${sideLabel} ${laneLabel} champion`}
        autoComplete="off"
        variant="sunken"
      />
    </label>
  );
}

type SummaryBlockProps = {
  title: string;
  items: string[];
};

function SummaryBlock({ title, items }: SummaryBlockProps) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="text-label uppercase tracking-[0.12em] text-muted-foreground">{title}</span>
      <ul className="space-y-[var(--space-1)] text-body text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type NotesFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
};

function NotesField({ id, label, value, onChange }: NotesFieldProps) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="flex items-center gap-[var(--space-2)] text-label uppercase tracking-[0.08em] text-muted-foreground">
        <NotebookPen className="size-[var(--space-4)] opacity-80" />
        {label}
      </span>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder="Short plan, spikes, target calls…"
        resize="resize-y"
        rows={4}
        variant="sunken"
        textareaClassName="leading-relaxed"
      />
    </div>
  );
}
