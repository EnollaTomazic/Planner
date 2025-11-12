// src/components/team/CheatSheet.tsx
"use client";

/**
 * CheatSheet — renders archetypes as accordion cards with persistent editing.
 * Editing uses write-through persistence so card copy + champion pools stay in sync.
 */

import * as React from "react";

import { usePersistentState } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import { IconButton } from "@/components/ui/primitives/IconButton";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Crosshair,
  GitBranch,
  Pencil,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Swords,
  Target,
} from "lucide-react";
import { ROLES } from "./constants";
import { DEFAULT_SHEET } from "./data";
import {
  type Archetype,
  type LaneExamples,
  decodeCheatSheet as decodeCheatSheetModel,
  ensureExamples as ensureExamplesModel,
} from "./cheatSheet.model";
import {
  Label,
  TitleEdit,
  ParagraphEdit,
  BulletListEdit,
} from "./CheatSheetEditors";
import { ChampListEditor } from "./ChampListEditor";

const ARCHETYPE_ICON_MAP: Record<string, LucideIcon> = {
  "front-to-back": ShieldCheck,
  dive: ArrowDownCircle,
  pick: Crosshair,
  "poke-siege": Target,
  "splitpush-131": GitBranch,
  wombo: Sparkles,
};

function archetypeIconFor(id: string): LucideIcon {
  return ARCHETYPE_ICON_MAP[id] ?? Swords;
}
export { decodeCheatSheet, ensureExamples } from "./cheatSheet.model";
export type { Archetype, LaneExamples } from "./cheatSheet.model";

export type CheatSheetProps = {
  className?: string;
  dense?: boolean;
  data?: Archetype[];
  query?: string;
  editing?: boolean;
};

/* ───────────── main component ───────────── */

export function CheatSheet({
  className = "",
  dense: _dense = false,
  data = DEFAULT_SHEET,
  query = "",
  editing = false,
}: CheatSheetProps) {
  const [sheet, setSheet] = usePersistentState<Archetype[]>(
    "team:cheatsheet.v2",
    data,
    {
      decode: decodeCheatSheetModel,
    },
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  React.useEffect(() => {
    let needsUpdate = false;
    const next = sheet.map((arc) => {
      const [safeExamples, changed] = ensureExamplesModel(arc.examples);
      if (!changed) return arc;
      needsUpdate = true;
      return {
        ...arc,
        examples: safeExamples,
      };
    });

    if (needsUpdate) {
      setSheet(next);
    }
  }, [sheet, setSheet]);

  React.useEffect(() => {
    if (!editing) setEditingId(null);
  }, [editing]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sheet;
    return sheet.filter((a) => {
      const hay = [
        a.title,
        a.description,
        ...(a.wins ?? []),
        ...(a.struggles ?? []),
        ...(a.tips ?? []),
        ...Object.values(a.examples ?? {}).flat(),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sheet, query]);

  React.useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set<string>();
      for (const item of filtered) {
        if (prev.has(item.id)) {
          next.add(item.id);
        }
      }
      if (next.size === 0 && filtered[0]) {
        next.add(filtered[0].id);
      }
      const unchanged =
        next.size === prev.size &&
        Array.from(next).every((id) => prev.has(id));
      return unchanged ? prev : next;
    });
  }, [filtered]);

  React.useEffect(() => {
    if (!editingId) return;
    setExpandedIds((prev) => {
      if (prev.has(editingId)) return prev;
      const next = new Set(prev);
      next.add(editingId);
      return next;
    });
  }, [editingId]);

  const patchArc = React.useCallback(
    (id: string, partial: Partial<Archetype>) => {
      setSheet((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;

          const base = { ...a, ...partial };
          const mergedExamples =
            "examples" in partial
              ? {
                  ...(a.examples ?? {}),
                  ...(partial.examples ?? {}),
                }
              : base.examples;

          const [safeExamples, changed] = ensureExamplesModel(mergedExamples);

          if ("examples" in partial || changed) {
            base.examples = safeExamples;
          }

          return base;
        }),
      );
    },
    [setSheet],
  );

  const toggleExpanded = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <section
      data-scope="team"
      className={cn("space-y-[var(--space-3)]", className)}
    >
      <div className="flex flex-col gap-[var(--space-3)]">
        {filtered.map((a) => {
          const isEditing = editing && editingId === a.id;
          const expanded = expandedIds.has(a.id);
          const Icon = archetypeIconFor(a.id);

          return (
            <article
              key={a.id}
              className="rounded-card border border-card-hairline bg-card/70 shadow-none backdrop-blur-sm"
            >
              <header className="flex items-start gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] sm:px-[var(--space-5)]">
                <button
                  type="button"
                  onClick={() => toggleExpanded(a.id)}
                  aria-expanded={expanded}
                  className="flex flex-1 items-center justify-between gap-[var(--space-3)] rounded-[var(--control-radius-lg)] px-[var(--space-2)] py-[var(--space-2)] text-left transition-colors duration-motion-sm ease-out hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex min-w-0 items-center gap-[var(--space-3)]">
                    <span className="flex size-[var(--space-8)] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-3">
                      <Icon aria-hidden className="size-[var(--space-5)]" />
                    </span>
                    <span className="min-w-0 text-ui font-semibold tracking-[-0.01em] text-foreground sm:text-title-sm">
                      {a.title}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-[var(--space-5)] text-muted-foreground transition-transform duration-motion-sm ease-out",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {editing ? (
                  <IconButton
                    title={isEditing ? "Save" : "Edit"}
                    aria-label={isEditing ? "Save" : "Edit"}
                    size="sm"
                    onClick={() => {
                      setExpandedIds((prev) => {
                        if (prev.has(a.id)) return prev;
                        const next = new Set(prev);
                        next.add(a.id);
                        return next;
                      });
                      setEditingId((current) =>
                        current === a.id ? null : a.id,
                      );
                    }}
                  >
                    {isEditing ? <Check /> : <Pencil />}
                  </IconButton>
                ) : null}
              </header>

              {expanded ? (
                <div className="px-[var(--space-4)] pb-[var(--space-5)] sm:px-[var(--space-5)]">
                  <div className="space-y-[var(--space-3)]">
                    {isEditing ? (
                      <TitleEdit
                        value={a.title}
                        editing={isEditing}
                        onChange={(v) => patchArc(a.id, { title: v })}
                      />
                    ) : null}
                    <ParagraphEdit
                      value={a.description}
                      editing={isEditing}
                      onChange={(v) => patchArc(a.id, { description: v })}
                    />
                  </div>

                  <div className="mt-[var(--space-5)] grid gap-[var(--space-4)] md:grid-cols-2">
                    <div>
                      <Label>Wins when</Label>
                      <BulletListEdit
                        items={a.wins}
                        onChange={(v) => patchArc(a.id, { wins: v })}
                        editing={isEditing}
                        ariaLabel="Wins when"
                        viewIcon={
                          <CircleCheck className="size-[var(--space-4)] text-success" />
                        }
                      />
                    </div>

                    {a.struggles?.length || isEditing ? (
                      <div>
                        <Label>Struggles vs</Label>
                        <BulletListEdit
                          items={a.struggles ?? []}
                          onChange={(v) => patchArc(a.id, { struggles: v })}
                          editing={isEditing}
                          ariaLabel="Struggles vs"
                          viewIcon={
                            <CircleX className="size-[var(--space-4)] text-danger" />
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  {a.tips?.length || isEditing ? (
                    <div className="mt-[var(--space-4)]">
                      <Label>Tips</Label>
                      <BulletListEdit
                        items={a.tips ?? []}
                        onChange={(v) => patchArc(a.id, { tips: v })}
                        editing={isEditing}
                        ariaLabel="Tips"
                        viewIcon={
                          <Sparkle className="size-[var(--space-4)] text-accent-3" />
                        }
                        itemClassName="text-body-sm text-muted-foreground"
                      />
                    </div>
                  ) : null}

                  <div className="mt-[var(--space-5)] space-y-[var(--space-3)]">
                    <Label>Champion pool</Label>
                    <div className="space-y-[var(--space-3)]">
                      {ROLES.map((role) => {
                        const champs = a.examples?.[role] ?? [];
                        const setChamps = (list: string[]) =>
                          patchArc(a.id, {
                            examples: { [role]: list } as LaneExamples,
                          });
                        const showRow = champs.length || isEditing;
                        if (!showRow) return null;
                        const tone = role.toLowerCase() as BadgeProps["tone"];

                        return (
                          <div
                            key={role}
                            className="flex flex-wrap items-start gap-[var(--space-3)]"
                          >
                            <Badge
                              tone={tone}
                              size="xs"
                              className="uppercase tracking-[0.1em]"
                            >
                              {role}
                            </Badge>
                            <ChampListEditor
                              list={champs}
                              onChange={setChamps}
                              editing={isEditing}
                              viewClassName="flex-1"
                              editClassName="flex-1"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
