// src/components/team/Builder.tsx
"use client";

import * as React from "react";
import { ArrowLeftRight, Copy, Eraser, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/primitives/Button";
import { FieldInput, FieldRoot, FieldTextarea } from "@/components/ui/primitives/Field";
import { usePersistentState } from "@/lib/db";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

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

    const filledCount = React.useMemo(() => {
      const countTeam = (t: Team) =>
        [t.top, t.jungle, t.mid, t.bot, t.support].filter((value) => {
          if (typeof value !== "string") {
            return false;
          }
          return value.trim().length > 0;
        }).length;
      return {
        allies: countTeam(state.allies),
        enemies: countTeam(state.enemies),
      };
    }, [state]);

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

    const clearAll = React.useCallback(() => {
      setState(() => ({
        allies: { ...EMPTY_TEAM },
        enemies: { ...EMPTY_TEAM },
      }));
    }, [setState]);

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

    const handleAlliesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("allies", lane, value);
      },
      [setLane],
    );

    const handleAlliesNotes = React.useCallback(
      (value: string) => {
        setNotes("allies", value);
      },
      [setNotes],
    );

    const handleEnemiesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("enemies", lane, value);
      },
      [setLane],
    );

    const handleEnemiesNotes = React.useCallback(
      (value: string) => {
        setNotes("enemies", value);
      },
      [setNotes],
    );

    const handleAlliesClear = React.useCallback(() => {
      clearSide("allies");
    }, [clearSide]);

    const handleEnemiesClear = React.useCallback(() => {
      clearSide("enemies");
    }, [clearSide]);

    const handleAlliesCopy = React.useCallback(() => {
      void copy("allies");
    }, [copy]);

    const handleEnemiesCopy = React.useCallback(() => {
      void copy("enemies");
    }, [copy]);

    const laneSuggestions = React.useMemo(() => {
      const values = new Set<string>();
      (Object.keys(state) as Side[]).forEach((side) => {
        LANES.forEach(({ key }) => {
          const value = state[side][key];
          if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
              values.add(trimmed);
            }
          }
        });
      });

      return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [state]);

    const insights = React.useMemo(() => createLaneInsights(state), [state]);

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
        <section className="rounded-card r-card-lg border border-card-hairline-60 bg-surface text-card-foreground shadow-depth-soft overflow-hidden">
          <div className="flex flex-col text-ui">
            <ActionToolbar
              alliesCount={filledCount.allies}
              enemiesCount={filledCount.enemies}
              onSwap={swapSides}
              onCopyAll={handleCopyAll}
              onCopyAllies={handleAlliesCopy}
              onCopyEnemies={handleEnemiesCopy}
              onClearAll={clearAll}
              onClearAllies={handleAlliesClear}
              onClearEnemies={handleEnemiesClear}
            />

            <div className="overflow-x-auto px-[var(--space-5)] pb-[var(--space-6)] pt-[var(--space-5)]">
              <div className="min-w-[min(58rem,100%)]">
                <LaneGrid
                  allies={state.allies}
                  enemies={state.enemies}
                  onAlliesLane={handleAlliesLane}
                  onEnemiesLane={handleEnemiesLane}
                  suggestions={laneSuggestions}
                />
              </div>
            </div>

            <SummaryPanel
              insights={insights}
              alliesNotes={state.allies.notes ?? ""}
              enemiesNotes={state.enemies.notes ?? ""}
              onAlliesNotesChange={handleAlliesNotes}
              onEnemiesNotesChange={handleEnemiesNotes}
            />
          </div>
        </section>
      </div>
    );
  },
);

type ActionToolbarProps = {
  alliesCount: number;
  enemiesCount: number;
  onSwap: () => void;
  onCopyAll: () => void;
  onCopyAllies: () => void;
  onCopyEnemies: () => void;
  onClearAll: () => void;
  onClearAllies: () => void;
  onClearEnemies: () => void;
};

function ActionToolbar({
  alliesCount,
  enemiesCount,
  onSwap,
  onCopyAll,
  onCopyAllies,
  onCopyEnemies,
  onClearAll,
  onClearAllies,
  onClearEnemies,
}: ActionToolbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-card-hairline-60 bg-surface/95 px-[var(--space-5)] py-[var(--space-4)] backdrop-blur supports-[backdrop-filter:blur(0px)]:bg-surface/80">
      <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-[var(--space-2)] text-label font-medium tracking-[0.06em] uppercase text-muted-foreground">
          <span>Team builder</span>
          <span className="inline-flex items-center gap-[var(--space-1)] rounded-full bg-[hsl(var(--accent-1)/0.12)] px-[var(--space-3)] py-[var(--space-1)] text-[hsl(var(--accent-1-foreground))] shadow-[var(--shadow-inset-hairline)]">
            Allies {alliesCount}/5
          </span>
          <span className="inline-flex items-center gap-[var(--space-1)] rounded-full bg-[hsl(var(--accent-3)/0.12)] px-[var(--space-3)] py-[var(--space-1)] text-[hsl(var(--accent-3-foreground))] shadow-[var(--shadow-inset-hairline)]">
            Enemies {enemiesCount}/5
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Button size="sm" variant="neo" onClick={onSwap} className="min-w-[7rem]">
            <ArrowLeftRight className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Swap sides
          </Button>
          <Button size="sm" variant="quiet" onClick={onCopyAll}>
            <Copy className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Copy all
          </Button>
          <Button size="sm" variant="quiet" onClick={onCopyAllies}>
            <Copy className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Copy allies
          </Button>
          <Button size="sm" variant="quiet" onClick={onCopyEnemies}>
            <Copy className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Copy enemies
          </Button>
          <Button size="sm" variant="quiet" onClick={onClearAllies}>
            <Eraser className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Clear allies
          </Button>
          <Button size="sm" variant="quiet" onClick={onClearEnemies}>
            <Eraser className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Clear enemies
          </Button>
          <Button size="sm" variant="quiet" onClick={onClearAll}>
            <Eraser className="mr-[var(--space-2)] size-[var(--space-4)]" />
            Clear all
          </Button>
        </div>
      </div>
    </header>
  );
}

type LaneGridProps = {
  allies: Team;
  enemies: Team;
  onAlliesLane: (lane: LaneKey, value: string) => void;
  onEnemiesLane: (lane: LaneKey, value: string) => void;
  suggestions: string[];
};

function LaneGrid({ allies, enemies, onAlliesLane, onEnemiesLane, suggestions }: LaneGridProps) {
  return (
    <div className="rounded-card border border-card-hairline-60 bg-surface-2/70 p-[var(--space-4)] shadow-[var(--shadow-outline-subtle)]">
      <div className="grid grid-cols-[minmax(7rem,0.45fr)_minmax(12rem,1fr)_minmax(12rem,1fr)] gap-x-[var(--space-5)]">
        <span className="text-label font-medium uppercase tracking-[0.06em] text-muted-foreground">Lane</span>
        <span className="flex items-center gap-[var(--space-2)] text-label font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Allies
        </span>
        <span className="flex items-center gap-[var(--space-2)] text-label font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Enemies
        </span>

        {LANES.map(({ key, label }, index) => {
          const alliesId = `allies-${key}`;
          const enemiesId = `enemies-${key}`;
          return (
            <React.Fragment key={key}>
              {index > 0 ? (
                <span className="col-span-3 h-px bg-card-hairline-40" aria-hidden />
              ) : null}

              <div className="py-[var(--space-3)]">
                <label
                  htmlFor={alliesId}
                  className="text-body font-medium tracking-[-0.01em] text-foreground/90"
                >
                  {label}
                </label>
              </div>

              <div className="py-[var(--space-3)]">
                <ChampionSelect
                  id={alliesId}
                  placeholder={`Allied ${label}`}
                  value={(allies[key] ?? "") as string}
                  onChange={(value) => onAlliesLane(key, value)}
                  suggestions={suggestions}
                />
              </div>

              <div className="py-[var(--space-3)]">
                <ChampionSelect
                  id={enemiesId}
                  placeholder={`Enemy ${label}`}
                  value={(enemies[key] ?? "") as string}
                  onChange={(value) => onEnemiesLane(key, value)}
                  suggestions={suggestions}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

type ChampionSelectProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
};

function ChampionSelect({ id, placeholder, value, onChange, suggestions }: ChampionSelectProps) {
  const listId = suggestions.length > 0 ? `${id}-suggestions` : undefined;

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      <FieldRoot
        variant="sunken"
        height="md"
        className="rounded-full border border-card-hairline-60 bg-[hsl(var(--surface-1)/0.92)] px-[var(--space-1)] shadow-[var(--shadow-inset-hairline)]"
      >
        <FieldInput
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder={placeholder}
          list={listId}
          aria-label={placeholder}
          className="rounded-full px-[var(--space-4)] text-body"
        />
      </FieldRoot>
      {listId ? (
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

type LaneInsights = ReturnType<typeof createLaneInsights>;

type SummaryPanelProps = {
  insights: LaneInsights;
  alliesNotes: string;
  enemiesNotes: string;
  onAlliesNotesChange: (value: string) => void;
  onEnemiesNotesChange: (value: string) => void;
};

function SummaryPanel({
  insights,
  alliesNotes,
  enemiesNotes,
  onAlliesNotesChange,
  onEnemiesNotesChange,
}: SummaryPanelProps) {
  return (
    <footer className="sticky bottom-0 z-20 border-t border-card-hairline-60 bg-surface/95 px-[var(--space-5)] py-[var(--space-5)] backdrop-blur supports-[backdrop-filter:blur(0px)]:bg-surface/80">
      <div className="grid gap-[var(--space-5)]">
        <div className="grid gap-[var(--space-4)] lg:grid-cols-[minmax(16rem,1fr)_minmax(18rem,1fr)] lg:gap-[var(--space-6)]">
          <InsightList title="Synergy focus" items={insights.synergy} empty="Lock in allied champions to surface synergy cues." />
          <InsightList title="Counter watch" items={insights.counters} empty="Add enemy picks to surface matchup notes." />
        </div>

        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          <NotesField
            id="allies-notes"
            label="Allies notes"
            value={alliesNotes}
            placeholder="Draft triggers, spike timings, roam pairings…"
            onChange={onAlliesNotesChange}
          />
          <NotesField
            id="enemies-notes"
            label="Enemies notes"
            value={enemiesNotes}
            placeholder="Threat windows, key cooldowns, punish ideas…"
            onChange={onEnemiesNotesChange}
          />
        </div>
      </div>
    </footer>
  );
}

type InsightListProps = {
  title: string;
  items: string[];
  empty: string;
};

function InsightList({ title, items, empty }: InsightListProps) {
  return (
    <div className="rounded-card border border-card-hairline-60 bg-surface-2/70 p-[var(--space-4)] shadow-[var(--shadow-outline-subtle)]">
      <h3 className="flex items-center gap-[var(--space-2)] text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-[var(--space-3)] space-y-[var(--space-2)] text-body leading-relaxed text-foreground/90">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-[var(--space-2)]">
              <span aria-hidden className="mt-[var(--space-1)] size-[var(--space-1)] rounded-full bg-[hsl(var(--accent-1))]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[var(--space-3)] text-body text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

type NotesFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function NotesField({ id, label, value, placeholder, onChange }: NotesFieldProps) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <label
        htmlFor={id}
        className="flex items-center gap-[var(--space-2)] text-label font-medium uppercase tracking-[0.06em] text-muted-foreground"
      >
        <NotebookPen className="size-[var(--space-4)] opacity-75" /> {label}
      </label>
      <FieldRoot
        variant="sunken"
        className={cn(
          "min-h-[var(--space-12)] rounded-card border border-card-hairline-60 bg-[hsl(var(--surface-1)/0.92)] shadow-[var(--shadow-inset-hairline)]",
          "focus-within:ring-2 focus-within:ring-[hsl(var(--accent-1)/0.6)]",
        )}
      >
        <FieldTextarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          rows={4}
          placeholder={placeholder}
          className="min-h-[var(--space-12)] resize-y text-body leading-relaxed"
        />
      </FieldRoot>
    </div>
  );
}

function createLaneInsights(state: TeamState) {
  const synergy: string[] = [];
  const counters: string[] = [];

  LANES.forEach(({ key, label }) => {
    const allyRaw = state.allies[key];
    const enemyRaw = state.enemies[key];
    const ally = typeof allyRaw === "string" ? allyRaw.trim() : "";
    const enemy = typeof enemyRaw === "string" ? enemyRaw.trim() : "";

    if (ally && enemy) {
      if (ally.localeCompare(enemy, undefined, { sensitivity: "accent" }) === 0) {
        counters.push(`Mirror matchup in ${label}: ${ally}. Track jungle pressure to break symmetry.`);
      } else {
        counters.push(`${ally} vs ${enemy} on ${label}. Prep counterplay windows and wave control.`);
      }
      return;
    }

    if (ally) {
      synergy.push(`${ally} locked for ${label}. Coordinate roam paths and objective timers around their spike.`);
    } else if (enemy) {
      counters.push(`${enemy} secured ${label}. Identify a response pick or early gank path.`);
    }
  });

  if (synergy.length === 0) {
    const allyFilled = LANES.filter(({ key }) => (state.allies[key] ?? "").toString().trim().length > 0).length;
    if (allyFilled === 0) {
      synergy.push("No allied lanes are locked yet. Start with comfort picks to surface coordination notes.");
    }
  }

  if (counters.length === 0) {
    const enemyFilled = LANES.filter(({ key }) => (state.enemies[key] ?? "").toString().trim().length > 0).length;
    if (enemyFilled === 0) {
      counters.push("Enemy draft is still open. Scout likely threats once picks appear.");
    }
  }

  return { synergy, counters };
}
