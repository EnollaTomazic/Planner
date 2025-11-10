"use client";

import "./style.css";

import * as React from "react";
import {
  ArrowLeftRight,
  Copy,
  Eraser,
  NotebookPen,
  Shield,
  Swords,
} from "lucide-react";
import { usePersistentState } from "@/lib/db";
import { copyText } from "@/lib/clipboard";

import { DEFAULT_SHEET, JUNGLE_ROWS, SPEED_HINT } from "./data";
import { ensureExamples } from "./cheatSheet.model";
import type { Archetype } from "./cheatSheet.model";
import type { Role } from "./constants";
import type { ClearSpeed } from "./data";

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

type ChampionSelectProps = {
  id: string;
  lane: LaneKey;
  laneLabel: string;
  sideLabel: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

const TEAM_KEY = "team_comp_v1";
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

const SIDE_LABEL: Record<Side, string> = {
  allies: "Allies",
  enemies: "Enemies",
};

const LANE_ROLE_MAP: Record<LaneKey, Role> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
};

const JUNGLE_LOOKUP = new Map(
  JUNGLE_ROWS.map((row) => [normalizeChampion(row.champ), row]),
);

const CLEAR_SPEED_RANK: Record<ClearSpeed, number> = {
  "Very Fast": 4,
  Fast: 3,
  Medium: 2,
  Slow: 1,
};

export function createInitialTeamState(): TeamState {
  return {
    allies: { ...EMPTY_TEAM },
    enemies: { ...EMPTY_TEAM },
  };
}

export function useTeamBuilderState() {
  return usePersistentState<TeamState>(TEAM_KEY, createInitialTeamState());
}

export type BuilderHandle = {
  swapSides: () => void;
  copyAll: () => void;
};

type BuilderProps = {
  editing?: boolean;
  state?: TeamState;
  onStateChange?: React.Dispatch<React.SetStateAction<TeamState>>;
};

type CoverageEntry = {
  lane: LaneKey;
  label: string;
  alliesFilled: boolean;
  enemiesFilled: boolean;
};

type CoverageSummary = {
  alliesFilled: number;
  enemiesFilled: number;
  alliesMissing: string[];
  enemiesMissing: string[];
  entries: CoverageEntry[];
};

type SynergySummary = {
  archetype: string;
  lanes: LaneKey[];
  description: string;
};

const MAX_SYNERGY_ITEMS = 2;

export const Builder = React.forwardRef<BuilderHandle, BuilderProps>(
  function Builder({ editing, state: providedState, onStateChange }, ref) {
    void editing;
    const [internalState, setInternalState] = useTeamBuilderState();
    const state = providedState ?? internalState;
    const setState = onStateChange ?? setInternalState;

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

    const clearSide = React.useCallback(
      (side: Side) => {
        setState((prev) => ({
          ...prev,
          [side]: { ...EMPTY_TEAM },
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

    const handleCopy = React.useCallback(
      (side: Side) => {
        void copy(side);
      },
      [copy],
    );

    const handleAlliesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("allies", lane, value);
      },
      [setLane],
    );

    const handleEnemiesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("enemies", lane, value);
      },
      [setLane],
    );

    const handleAlliesNotes = React.useCallback(
      (value: string) => {
        setNotes("allies", value);
      },
      [setNotes],
    );

    const handleEnemiesNotes = React.useCallback(
      (value: string) => {
        setNotes("enemies", value);
      },
      [setNotes],
    );

    const filledCount = React.useMemo(() => {
      const countTeam = (team: Team) =>
        LANES.reduce((count, lane) => {
          const value = team[lane.key];
          if (typeof value !== "string") return count;
          return value.trim().length > 0 ? count + 1 : count;
        }, 0);

      return {
        allies: countTeam(state.allies),
        enemies: countTeam(state.enemies),
      };
    }, [state]);

    const coverage = React.useMemo(
      () => buildCoverageSummary(state),
      [state],
    );

    const synergy = React.useMemo(
      () => buildSynergySummary(state.allies),
      [state.allies],
    );

    const counterInsights = React.useMemo(
      () => buildCounterInsights(state),
      [state],
    );

    const resetAllies = React.useCallback(() => {
      clearSide("allies");
    }, [clearSide]);

    const resetEnemies = React.useCallback(() => {
      clearSide("enemies");
    }, [clearSide]);

    React.useImperativeHandle(
      ref,
      () => ({
        swapSides,
        copyAll: handleCopyAll,
      }),
      [handleCopyAll, swapSides],
    );

    return (
      <div data-scope="team" className="w-full mt-[var(--space-6)]">
        <section className="rounded-card r-card-xl glitch-card text-card-foreground overflow-hidden">
          <div className="flex flex-col">
            <div className="p-[var(--space-5)] pb-[var(--space-6)] text-ui">
              <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
                <div className="glitch-title glitch-flicker title-glow inline-flex flex-col gap-[var(--space-1)]" data-text="Team Builder">
                  <span className="text-label tracking-[0.15em] uppercase text-muted-foreground">
                    Draft matrix
                  </span>
                  <strong className="text-display-sm font-semibold tracking-[-0.01em]">
                    Team Builder Grid
                  </strong>
                </div>
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <ToolbarButton
                    label="Reset allies"
                    icon={<Eraser className="size-[var(--space-4)]" />}
                    onClick={resetAllies}
                  />
                  <ToolbarButton
                    label="Reset enemies"
                    icon={<Eraser className="size-[var(--space-4)]" />}
                    onClick={resetEnemies}
                  />
                  <ToolbarButton
                    label="Swap sides"
                    icon={<ArrowLeftRight className="size-[var(--space-4)]" />}
                    onClick={swapSides}
                    variant="solid"
                  />
                  <ToolbarButton
                    label="Copy allies"
                    icon={<Shield className="size-[var(--space-4)]" />}
                    onClick={() => handleCopy("allies")}
                  />
                  <ToolbarButton
                    label="Copy enemies"
                    icon={<Swords className="size-[var(--space-4)]" />}
                    onClick={() => handleCopy("enemies")}
                  />
                  <ToolbarButton
                    label="Copy full grid"
                    icon={<Copy className="size-[var(--space-4)]" />}
                    onClick={handleCopyAll}
                  />
                </div>
              </div>

              <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-5)]">
                <div className="grid grid-cols-2 gap-[var(--space-4)]">
                  <ColumnHeader
                    icon={<Shield className="size-[var(--space-4)]" />}
                    label="Allies"
                    filled={filledCount.allies}
                  />
                  <ColumnHeader
                    icon={<Swords className="size-[var(--space-4)]" />}
                    label="Enemies"
                    filled={filledCount.enemies}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[var(--space-4)]">
                  {LANES.map(({ key, label }) => (
                    <React.Fragment key={key}>
                      <ChampionSelect
                        id={`allies-${key}`}
                        lane={key}
                        laneLabel={label}
                        sideLabel={SIDE_LABEL.allies}
                        icon={<Shield className="size-[var(--space-4)]" />}
                        placeholder={`Lock ${label}`}
                        value={(state.allies[key] as string) ?? ""}
                        onChange={(value) => handleAlliesLane(key, value)}
                      />
                      <ChampionSelect
                        id={`enemies-${key}`}
                        lane={key}
                        laneLabel={label}
                        sideLabel={SIDE_LABEL.enemies}
                        icon={<Swords className="size-[var(--space-4)]" />}
                        placeholder={`Scout ${label}`}
                        value={(state.enemies[key] as string) ?? ""}
                        onChange={(value) => handleEnemiesLane(key, value)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <footer className="sticky bottom-0 border-t border-card-hairline-65 bg-background/92 backdrop-blur-sm">
              <div className="grid gap-[var(--space-5)] p-[var(--space-5)] text-ui">
                <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                  <SummaryBlock title="Lane coverage">
                    <p className="text-body-sm text-muted-foreground">
                      Allies {coverage.alliesFilled}/5 &middot; Enemies {coverage.enemiesFilled}/5
                    </p>
                    <ul className="mt-[var(--space-2)] grid gap-[var(--space-2)] text-label text-muted-foreground/90">
                      {coverage.entries.map((entry) => (
                        <li key={entry.lane} className="flex items-center justify-between">
                          <span>{entry.label}</span>
                          <span className="font-medium tracking-[0.05em] uppercase">
                            {entry.alliesFilled ? "A" : "-"} / {entry.enemiesFilled ? "E" : "-"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SummaryBlock>

                  <SummaryBlock title="Synergy focus">
                    {synergy.length === 0 ? (
                      <p className="text-body-sm text-muted-foreground">
                        Lock more allies to surface synergy patterns.
                      </p>
                    ) : (
                      <ul className="grid gap-[var(--space-2)]">
                        {synergy.map((item) => (
                          <li key={item.archetype} className="rounded-card border border-card-hairline-40 bg-card/60 p-[var(--space-3)]">
                            <p className="text-label font-semibold tracking-[0.06em] uppercase">
                              {item.archetype}
                            </p>
                            <p className="text-body-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="mt-[var(--space-2)] text-label text-accent-3">
                              {item.lanes.map((laneKey) => laneLabel(laneKey)).join(", ")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SummaryBlock>
                </div>

                <SummaryBlock title="Counter insights">
                  {counterInsights.length === 0 ? (
                    <p className="text-body-sm text-muted-foreground">
                      Fill lanes to surface matchup notes.
                    </p>
                  ) : (
                    <ul className="grid gap-[var(--space-2)]">
                      {counterInsights.map((insight, index) => (
                        <li key={`${insight}-${index}`} className="rounded-card border border-card-hairline-40 bg-card/60 p-[var(--space-3)] text-body-sm text-muted-foreground">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  )}
                </SummaryBlock>

                <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                  <NotesBlock
                    id="allies-notes"
                    label="Allies notes"
                    value={state.allies.notes ?? ""}
                    onChange={handleAlliesNotes}
                  />
                  <NotesBlock
                    id="enemies-notes"
                    label="Enemy scouting"
                    value={state.enemies.notes ?? ""}
                    onChange={handleEnemiesNotes}
                  />
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    );
  },
);

Builder.displayName = "Builder";

function ChampionSelect({
  id,
  lane,
  laneLabel,
  sideLabel,
  icon,
  placeholder,
  value,
  onChange,
}: ChampionSelectProps) {
  return (
    <div
      className="champion-select relative flex flex-col gap-[var(--space-2)]"
      data-side={sideLabel.toLowerCase()}
      data-lane={lane}
    >
      <div className="flex items-center justify-between text-label font-semibold tracking-[0.08em] uppercase text-muted-foreground">
        <span className="inline-flex items-center gap-[var(--space-2)] text-foreground">
          {icon}
          {laneLabel}
        </span>
        <span className="text-muted-foreground/80">{sideLabel}</span>
      </div>
      <input
        id={id}
        type="text"
        className="sunken-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        autoComplete="off"
        autoCapitalize="words"
      />
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "quiet" | "solid";
};

function ToolbarButton({ label, icon, onClick, variant = "quiet" }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={["toolbar-button", variant === "solid" ? "toolbar-button--solid" : "toolbar-button--quiet"].join(" ")}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

function ColumnHeader({
  icon,
  label,
  filled,
}: {
  icon: React.ReactNode;
  label: string;
  filled: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-card border border-card-hairline-40 bg-card/70 px-[var(--space-4)] py-[var(--space-3)]">
      <span className="inline-flex items-center gap-[var(--space-2)] text-label tracking-[0.08em] uppercase">
        {icon}
        {label}
      </span>
      <span className="text-body-sm text-muted-foreground">{filled}/5</span>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-card-hairline-40 bg-card/40 p-[var(--space-4)] shadow-[var(--shadow-sm)]">
      <header className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
        <span className="text-label font-semibold tracking-[0.08em] uppercase text-muted-foreground">
          {title}
        </span>
      </header>
      <div className="grid gap-[var(--space-2)]">{children}</div>
    </section>
  );
}

type NotesBlockProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function NotesBlock({ id, label, value, onChange }: NotesBlockProps) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <label
        className="inline-flex items-center gap-[var(--space-2)] text-label font-medium tracking-[0.05em] text-muted-foreground"
        htmlFor={id}
      >
        <NotebookPen className="size-[var(--space-4)] opacity-80" />
        {label}
      </label>
      <SunkenTextarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="Drop matchup cues, objective timers, or execution notes."
        rows={4}
      />
    </div>
  );
}

function SunkenTextarea(
  { className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={["sunken-textarea", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

function buildCoverageSummary(state: TeamState): CoverageSummary {
  const entries: CoverageEntry[] = LANES.map(({ key, label }) => {
    const ally = state.allies[key];
    const enemy = state.enemies[key];
    return {
      lane: key,
      label,
      alliesFilled: typeof ally === "string" && ally.trim().length > 0,
      enemiesFilled: typeof enemy === "string" && enemy.trim().length > 0,
    };
  });

  const alliesFilled = entries.filter((entry) => entry.alliesFilled).length;
  const enemiesFilled = entries.filter((entry) => entry.enemiesFilled).length;

  return {
    alliesFilled,
    enemiesFilled,
    alliesMissing: entries
      .filter((entry) => !entry.alliesFilled)
      .map((entry) => entry.label),
    enemiesMissing: entries
      .filter((entry) => !entry.enemiesFilled)
      .map((entry) => entry.label),
    entries,
  };
}

function buildSynergySummary(allies: Team): SynergySummary[] {
  const filled = LANES.filter(({ key }) => {
    const value = allies[key];
    return typeof value === "string" && value.trim().length > 0;
  });

  if (filled.length === 0) {
    return [];
  }

  const scores = DEFAULT_SHEET.map((archetype) =>
    scoreArchetype(archetype, allies),
  ).filter((score) => score.matches.length > 0);

  if (scores.length === 0) {
    return [];
  }

  return scores
    .sort((a, b) => {
      if (b.matches.length !== a.matches.length) {
        return b.matches.length - a.matches.length;
      }
      return a.archetype.title.localeCompare(b.archetype.title);
    })
    .slice(0, MAX_SYNERGY_ITEMS)
    .map((score) => ({
      archetype: score.archetype.title,
      lanes: score.matches,
      description: score.archetype.description,
    }));
}

type ArchetypeScore = {
  archetype: Archetype;
  matches: LaneKey[];
};

function scoreArchetype(archetype: Archetype, allies: Team): ArchetypeScore {
  const matches: LaneKey[] = [];
  const [examples] = ensureExamples(archetype.examples);

  for (const { key, label } of LANES) {
    void label;
    const pick = allies[key];
    if (typeof pick !== "string" || pick.trim().length === 0) continue;

    const role = LANE_ROLE_MAP[key];
    const options = examples[role];
    if (!Array.isArray(options) || options.length === 0) continue;

    const normalizedPick = normalizeChampion(pick);
    const match = options.some((candidate) => {
      return normalizeChampion(candidate) === normalizedPick;
    });

    if (match) {
      matches.push(key);
    }
  }

  return { archetype, matches };
}

function buildCounterInsights(state: TeamState): string[] {
  const insights: string[] = [];

  const jungleTempo = describeJungleTempo(state);
  if (jungleTempo) {
    insights.push(jungleTempo);
  }

  for (const { key, label } of LANES) {
    const ally = (state.allies[key] ?? "").trim();
    const enemy = (state.enemies[key] ?? "").trim();

    if (!ally && !enemy) continue;

    if (ally && enemy) {
      if (normalizeChampion(ally) === normalizeChampion(enemy)) {
        insights.push(`${label}: Mirror matchup on ${titleCase(ally)} — skill check lane.`);
      } else {
        insights.push(
          `${label}: ${titleCase(ally)} into ${titleCase(enemy)} — prep wave plan and counter window.`,
        );
      }
    } else if (ally) {
      insights.push(`${label}: Enemy pick open — hold ${titleCase(ally)} for counter options.`);
    } else if (enemy) {
      insights.push(`${label}: Need response into ${titleCase(enemy)}.`);
    }
  }

  return insights.slice(0, 6);
}

function describeJungleTempo(state: TeamState): string | null {
  const ally = (state.allies.jungle ?? "").trim();
  const enemy = (state.enemies.jungle ?? "").trim();
  if (!ally && !enemy) return null;

  const allyInfo = ally ? JUNGLE_LOOKUP.get(normalizeChampion(ally)) : null;
  const enemyInfo = enemy ? JUNGLE_LOOKUP.get(normalizeChampion(enemy)) : null;

  if (!allyInfo && !enemyInfo) {
    return null;
  }

  const allySpeed = allyInfo?.speed ?? "Unknown";
  const enemySpeed = enemyInfo?.speed ?? "Unknown";

  if (allyInfo && enemyInfo) {
    const window = [allyInfo.speed, enemyInfo.speed]
      .map((speed) => SPEED_HINT[speed] ?? "")
      .filter(Boolean)
      .join(" vs ");
    const windowText = window ? ` (${window})` : "";
    const allyRank = CLEAR_SPEED_RANK[allyInfo.speed];
    const enemyRank = CLEAR_SPEED_RANK[enemyInfo.speed];
    const lean =
      allyRank === enemyRank
        ? ""
        : allyRank > enemyRank
          ? " Allies hit tempo first."
          : " Enemies hit tempo first.";
    return `Jungle tempo: ${titleCase(ally)} ${allySpeed}${windowText} vs ${titleCase(enemy)} ${enemySpeed}.${lean}`;
  }

  if (allyInfo) {
    const window = SPEED_HINT[allyInfo.speed];
    return `Jungle tempo: ${titleCase(ally)} ${allyInfo.speed}${window ? ` (${window})` : ""} — play for first move.`;
  }

  if (enemyInfo) {
    const window = SPEED_HINT[enemyInfo.speed];
    return `Jungle tempo: ${titleCase(enemy)} ${enemyInfo.speed}${window ? ` (${window})` : ""} — expect pressure.`;
  }

  return null;
}

function stringify(state: TeamState) {
  const left = teamToLines(state.allies);
  const right = teamToLines(state.enemies);
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

function teamToLines(team: Team) {
  return [
    `Top: ${team.top || "-"}`,
    `Jungle: ${team.jungle || "-"}`,
    `Mid: ${team.mid || "-"}`,
    `Bot: ${team.bot || "-"}`,
    `Support: ${team.support || "-"}`,
    ...(team.notes?.trim() ? ["", `Notes: ${team.notes.trim()}`] : []),
  ].join("\n");
}

function normalizeChampion(name: string) {
  return name.trim().toLowerCase();
}

function titleCase(value: string) {
  if (!value) return value;
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function laneLabel(lane: LaneKey) {
  return LANES.find((entry) => entry.key === lane)?.label ?? lane;
}
