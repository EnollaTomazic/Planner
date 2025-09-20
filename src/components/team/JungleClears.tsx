// src/components/team/JungleClears.tsx
"use client";
import "./style.css";

/**
 * JungleClears
 * - Top filter area uses <Hero> with pill search and count.
 * - Hint text sits inside the Hero body.
 * - Bucket cards are SectionCard-based with big time on the right.
 * - Two cards per row on md+.
 * - Titles and timers now use glitch-title + glitch-flicker + title-glow.
 */

import React, { useMemo, useState, useEffect } from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import { usePersistentState, uid } from "@/lib/db";
import { isRecord, isStringArray } from "@/lib/validators";
import { Timer, Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { JUNGLE_ROWS, SPEED_HINT, type ClearSpeed } from "./data";

type JunglerRowSeed = (typeof JUNGLE_ROWS)[number];
type JunglerRow = JunglerRowSeed & { id: string };
const STORE_KEY = "team:jungle.clears.v1";
const SEEDS: JunglerRow[] = JUNGLE_ROWS.map((r) => ({ ...r, id: uid("jg") }));
const BUCKETS: ClearSpeed[] = ["Very Fast", "Fast", "Medium", "Slow"];
const SPEED_SET = new Set<ClearSpeed>(BUCKETS);
const NEEDS_PERSIST = Symbol("team:jungle.clears.needsPersist");
type NormalizedRows = JunglerRow[] & { [NEEDS_PERSIST]?: true };

function decodeRows(value: unknown): JunglerRow[] | null {
  if (!Array.isArray(value)) return null;

  const next: NormalizedRows = [];
  let assignedNewId = false;

  for (const raw of value) {
    if (!isRecord(raw)) {
      continue;
    }

    const rawSpeed = raw.speed;
    const speed: ClearSpeed =
      typeof rawSpeed === "string" && SPEED_SET.has(rawSpeed as ClearSpeed)
        ? (rawSpeed as ClearSpeed)
        : "Medium";

    const champ = typeof raw.champ === "string" ? raw.champ : "";
    const type = isStringArray(raw.type)
      ? raw.type.filter((tag) => tag.length > 0)
      : [];
    const notes =
      typeof raw.notes === "string" ? raw.notes : undefined;

    let id: string;
    if (typeof raw.id === "string" && raw.id.trim() !== "") {
      id = raw.id;
    } else {
      id = uid("jg");
      assignedNewId = true;
    }

    next.push({
      id,
      champ,
      speed,
      type,
      notes,
    });
  }

  if (assignedNewId) {
    Object.defineProperty(next, NEEDS_PERSIST, {
      value: true,
      enumerable: false,
    });
  }

  return next;
}

function needsPersist(rows: JunglerRow[]): rows is NormalizedRows {
  return Boolean((rows as NormalizedRows)[NEEDS_PERSIST]);
}

const SPEED_PERSONA: Record<ClearSpeed, { tag: string; line: string }> = {
  "Very Fast": {
    tag: "Zoomies",
    line: "Turbo 3-camp pace. Invade timings and double-crab angles are on the table.",
  },
  Fast: {
    tag: "Tempo Bully",
    line: "You hit prio first. Fight on camps, trade up, and push the map.",
  },
  Medium: {
    tag: "Stable Path",
    line: "Play the map, not the stopwatch. Shadow lanes, contest second spawn.",
  },
  Slow: {
    tag: "Gank Goblin",
    line: "Skip races. Stack vision, create angles, flip lanes instead of timers.",
  },
};

const SPEED_TIME: Record<ClearSpeed, string> = {
  "Very Fast": "3:00",
  Fast: "3:05–3:20",
  Medium: "3:25–3:40",
  Slow: "≥3:45",
};

export type JungleClearsHandle = {
  addRow: (bucket: ClearSpeed) => void;
};

export default React.forwardRef<
  JungleClearsHandle,
  {
    editing: boolean;
    query: string;
    onCountChange?: (n: number) => void;
    onTargetBucketChange?: (bucket: ClearSpeed) => void;
  }
>(function JungleClears(
  { editing, query, onCountChange, onTargetBucketChange },
  ref,
) {
  const [items, setItems] = usePersistentState<JunglerRow[]>(STORE_KEY, SEEDS, {
    decode: decodeRows,
  });
  const [editingRow, setEditingRow] = useState<{
    id: string;
    champ: string;
    type: string;
    notes: string;
  } | null>(null);

  useEffect(() => {
    if (items.every((row) => typeof (row as unknown as { champ?: unknown }).champ === "string")) {
      return;
    }

    setItems((prev) => {
      let changed = false;
      const next = prev.map((row) => {
        const champValue = (row as unknown as { champ?: unknown }).champ;
        if (typeof champValue === "string") {
          return row;
        }

        changed = true;
        return { ...row, champ: "" };
      });

      return changed ? next : prev;
    });
  }, [items, setItems]);

  useEffect(() => {
    if (!needsPersist(items)) return;
    setItems((current) => current.map((row) => ({ ...row })));
  }, [items, setItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (!q) return true;
      const hay = [r.champ, ...(r.type ?? []), r.notes ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, items]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered, onCountChange]);

  const exampleByBucket = useMemo(() => {
    const map = {} as Record<ClearSpeed, string>;
    for (const b of BUCKETS) {
      const row = items.find((r) => {
        const champ = (r.champ ?? "").trim();
        return r.speed === b && champ !== "";
      });
      const champ = (row?.champ ?? "").trim();
      map[b] = champ === "" ? "-" : champ;
    }
    return map;
  }, [items]);

  const startEdit = React.useCallback(
    (r: JunglerRow) => {
      onTargetBucketChange?.(r.speed);
      setEditingRow({
        id: r.id,
        champ: r.champ ?? "",
        type: (r.type ?? []).join(", "),
        notes: r.notes ?? "",
      });
    },
    [setEditingRow, onTargetBucketChange],
  );

  const cancelEdit = React.useCallback(() => {
    if (editingRow) {
      const existing = items.find((r) => r.id === editingRow.id);
      const champ = (existing?.champ ?? "").trim();
      if (existing && champ === "") {
        setItems((prev) => prev.filter((r) => r.id !== editingRow.id));
      }
    }
    setEditingRow(null);
  }, [editingRow, items, setEditingRow, setItems]);

  const saveEdit = React.useCallback(() => {
    if (!editingRow) return;
    const champInput = (editingRow.champ ?? "").trim();
    const typeInput = editingRow.type ?? "";
    const notesInput = (editingRow.notes ?? "").trim();

    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== editingRow.id) {
          return r;
        }

        const nextType = typeInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        const nextChamp = champInput !== "" ? champInput : (r.champ ?? "");
        const nextNotes = notesInput === "" ? undefined : notesInput;

        return {
          ...r,
          champ: nextChamp,
          type: nextType,
          notes: nextNotes,
        };
      }),
    );
    setEditingRow(null);
  }, [editingRow, setItems, setEditingRow]);

  const deleteRow = React.useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((r) => r.id !== id));
    },
    [setItems],
  );

  const addRow = React.useCallback(
    (bucket: ClearSpeed) => {
      const newRow: JunglerRow = {
        id: uid("jg"),
        champ: "",
        speed: bucket,
        type: [],
        notes: "",
      };
      setItems((prev) => [...prev, newRow]);
      setEditingRow({ id: newRow.id, champ: "", type: "", notes: "" });
      onTargetBucketChange?.(bucket);
    },
    [setItems, setEditingRow, onTargetBucketChange],
  );

  useEffect(() => {
    if (!editing) cancelEdit();
  }, [editing, cancelEdit]);

  React.useImperativeHandle(ref, () => ({ addRow }), [addRow]);

  return (
    <div
      data-scope="team"
      className="grid gap-[var(--space-4)] sm:gap-[var(--space-6)]"
    >
      <div className="grid grid-cols-12 gap-[var(--space-6)]">
        {BUCKETS.map((bucket) => {
          const rowsAll = items.filter((r) => r.speed === bucket);
          const rows = filtered.filter((r) => r.speed === bucket);

          return (
            <SectionCard key={bucket} className="col-span-12 md:col-span-6">
              <SectionCard.Header
                sticky
                title={
                  <div className="flex items-center gap-[var(--space-2)]">
                    <Timer className="opacity-80" />
                    {/* Glitch title + glow */}
                    <span
                      className="glitch-title glitch-flicker title-glow text-title sm:text-title-lg md:text-title-lg font-semibold"
                      data-text={bucket}
                    >
                      {bucket}
                    </span>
                  </div>
                }
                actions={
                  // Big timer: same glitch treatment + glow
                  <span
                    className="glitch-title glitch-flicker title-glow font-mono leading-none text-title-lg sm:text-title-lg md:text-title-lg"
                    data-text={SPEED_TIME[bucket]}
                    aria-label="Expected first-clear timing"
                    title="Expected first-clear timing"
                  >
                    {SPEED_TIME[bucket]}
                  </span>
                }
              />
              <SectionCard.Body>
                <div className="mb-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="rounded-[var(--radius-full)] border border-border bg-card px-[var(--space-2)] py-[var(--space-1)] text-label tracking-wide uppercase">
                    {SPEED_PERSONA[bucket].tag}
                  </span>
                  <span className="text-ui text-muted-foreground">
                    {SPEED_HINT[bucket]}
                  </span>
                </div>

                {/* Example row (canonical pills) */}
                <div className="mb-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="text-muted-foreground text-ui">
                    Example:
                  </span>
                  <span className="pill pill-compact text-label">
                    {exampleByBucket[bucket]}
                  </span>
                  <span className="text-label text-muted-foreground">
                    ({rowsAll.length} total)
                  </span>
                </div>

                {editing && (
                  <div className="mb-[var(--space-2)] flex justify-end">
                    <IconButton
                      size="sm"
                      iconSize="xs"
                      aria-label="Add row"
                      onClick={() => addRow(bucket)}
                      variant="solid"
                    >
                      <Plus />
                    </IconButton>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-ui">
                    <caption className="sr-only">
                      {bucket} junglers with types and notes
                    </caption>
                    <thead className="text-left text-muted-foreground">
                      <tr className="h-9">
                        <th scope="col" className="pr-[var(--space-3)]">
                          Champion
                        </th>
                        <th scope="col" className="pr-[var(--space-3)]">
                          Type
                        </th>
                        <th scope="col" className="pr-[var(--space-3)]">
                          Notes
                        </th>
                        <th scope="col" className="w-12 pr-[var(--space-3)]">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r: JunglerRow) =>
                        editingRow?.id === r.id ? (
                          <tr
                            key={r.id}
                            className="h-10 border-t border-border/40 hover:bg-card/45"
                          >
                            <td className="py-[var(--space-2)] pr-[var(--space-3)] font-medium">
                              <Input
                                aria-label="Champion"
                                name="champion"
                                value={editingRow.champ}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    champ: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <Input
                                aria-label="Type"
                                placeholder="AD, Assassin"
                                name="type"
                                value={editingRow.type}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    type: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <Input
                                aria-label="Notes"
                                name="notes"
                                value={editingRow.notes}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    notes: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <div className="flex gap-[var(--space-1)]">
                                <IconButton
                                  size="sm"
                                  iconSize="xs"
                                  aria-label="Save"
                                  onClick={saveEdit}
                                >
                                  <Check />
                                </IconButton>
                                <IconButton
                                  size="sm"
                                  iconSize="xs"
                                  tone="danger"
                                  aria-label="Cancel"
                                  onClick={cancelEdit}
                                >
                                  <X />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={r.id}
                            className="h-10 border-t border-border/40 hover:bg-card/45"
                          >
                            <td className="py-[var(--space-2)] pr-[var(--space-3)] font-medium">{r.champ}</td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <div className="flex flex-wrap gap-[var(--space-2)]">
                                {(r.type ?? []).map((t) => (
                                  <span
                                    key={t}
                                    className="pill pill-compact text-label"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">{r.notes ?? "-"}</td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              {editing && (
                                <div className="flex gap-[var(--space-1)]">
                                  <IconButton
                                    size="sm"
                                    iconSize="xs"
                                    aria-label="Edit"
                                    onClick={() => startEdit(r)}
                                  >
                                    <Pencil />
                                  </IconButton>
                                  <IconButton
                                    size="sm"
                                    iconSize="xs"
                                    tone="danger"
                                    aria-label="Delete"
                                    onClick={() => deleteRow(r.id)}
                                  >
                                    <Trash2 />
                                  </IconButton>
                                </div>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard.Body>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
});
