// src/components/team/Reminders.tsx
"use client";

/**
 * Team Reminders (Lavender-Glitch, neon-outlined)
 * - Local-first via usePersistentState("team.reminders.v1")
 * - Search + group chips + pinned toggle
 * - Add / duplicate / delete / reset curated seeds
 * - Inline edit (Enter saves, Esc cancels)
 * - Cards use glitch-card border
 * - Quick Add (input + button + neon quote) now lives in the SAME panel as the cards (SectionCard.Body)
 */


import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Button from "@/components/ui/primitives/Button";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import Badge from "@/components/ui/primitives/Badge";
import IconButton from "@/components/ui/primitives/IconButton";
import TabBar from "@/components/ui/layout/TabBar";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import { uid, usePersistentState } from "@/lib/db";
import useAutoFocus from "@/lib/useAutoFocus";
import useDebouncedCallback from "@/lib/useDebouncedCallback";
import { GOALS_STICKY_TOP_CLASS } from "./constants";
import {
  Search,
  Plus,
  Pin,
  PinOff,
  Pencil,
  Check,
  X,
  Trash2,
  Copy,
} from "lucide-react";

type Source = "MLA" | "BLA" | "BrokenByConcept" | "Custom";
type Group = "quick" | "pregame" | "laning" | "trading" | "tempo" | "review";

export type Reminder = {
  id: string;
  title: string;
  body?: string;
  tags: string[];
  source: Source;
  group: Group;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

const STORE_KEY = "team.reminders.v1";

/* ---------- curated seeds ---------- */
function R(
  title: string,
  body: string,
  tags: string[],
  source: Source,
  group: Group,
  pinned = false
): Reminder {
  const now = Date.now();
  return {
    id: uid("rem"),
    title,
    body,
    tags,
    source,
    group,
    pinned,
    createdAt: now,
    updatedAt: now,
  };
}

const SEEDS: Reminder[] = [
  R("Hit 2 first", "Push 3 melees → step up together or respect if losing push.", ["Level 2","Bot"], "BLA", "quick", true),
  R("Jungle start check", "Track start → first gank lane → second spawn prio.", ["Jungle Track"], "BrokenByConcept", "quick", true),
  R("3-wave plan", "Say it out loud: slow then crash 3 OR hold then thin/freeze.", ["Waves"], "BLA", "pregame"),
  R("Ward at 2:30", "River/tri on 2:30. Sweep before shove windows.", ["Vision"], "BrokenByConcept", "pregame"),
  R("Space with casters", "Trade when your casters live; back off on enemy wave.", ["Trading","Wave"], "BLA", "laning"),
  R("CD punish", "Trade on enemy spell/CD gaps. Count sums for all-ins.", ["Timers"], "MLA", "trading"),
  R("Good recall", "Shove → recall on spike → arrive first to river.", ["Tempo"], "BrokenByConcept", "tempo"),
  R("Death audit", "Why did you die? Wave, vision, jungle, greed. Name fix.", ["Review"], "BLA", "review"),
];

const GROUP_TABS: Array<{ key: Group | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "quick", label: "Quick" },
  { key: "pregame", label: "Pre-Game" },
  { key: "laning", label: "Laning" },
  { key: "trading", label: "Trading" },
  { key: "tempo", label: "Tempo" },
  { key: "review", label: "Review" },
];

/* ---------- component ---------- */

export default function Reminders() {
  const [items, setItems] = usePersistentState<Reminder[]>(STORE_KEY, SEEDS);
  const [searchState, setSearchState] = React.useState(() => ({
    input: "",
    committed: "",
  }));
  const [onlyPinned, setOnlyPinned] = React.useState(false);
  const [group, setGroup] = React.useState<Group | "all">("all");
  const [quickAdd, setQuickAdd] = React.useState(""); // Quick Add text

  const { input: searchInput, committed: query } = searchState;

  const [commitQuery, cancelCommitQuery] = useDebouncedCallback(
    (next: string) => {
      setSearchState((prev) => {
        if (prev.committed === next) {
          return prev;
        }
        return { ...prev, committed: next };
      });
    },
    300,
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;

      setSearchState((prev) => {
        if (next === "") {
          if (prev.input === "" && prev.committed === "") {
            return prev;
          }
          return { input: "", committed: "" };
        }

        if (prev.input === next) {
          return prev;
        }

        return { ...prev, input: next };
      });

      if (next === "") {
        cancelCommitQuery();
        return;
      }

      commitQuery(next);
    },
    [commitQuery, cancelCommitQuery],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(r => (group === "all" ? true : r.group === group))
      .filter(r => (onlyPinned ? r.pinned : true))
      .filter(r => {
        if (!q) return true;
        const hay = [r.title, r.body ?? "", r.tags.join(" "), r.source, r.group].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (!!b.pinned === !!a.pinned) return b.updatedAt - a.updatedAt;
        return Number(b.pinned) - Number(a.pinned);
      });
  }, [items, group, onlyPinned, query]);

  function addNewWithTitle(titleText?: string) {
    const title = (titleText ?? "New reminder").trim();
    if (!title) return;
    const now = Date.now();
    const chosenGroup: Group = group === "all" ? "pregame" : group;
    const next: Reminder = {
      id: uid("rem"),
      title,
      body: "",
      tags: [],
      source: "Custom",
      group: chosenGroup,
      pinned: chosenGroup === "quick",
      createdAt: now,
      updatedAt: now,
    };
    setItems(prev => [next, ...prev]);
  }

  function addQuick() {
    const t = quickAdd.trim();
    if (!t) return;
    addNewWithTitle(t);
    setQuickAdd("");
  }

  function patch(id: string, partial: Partial<Reminder>) {
    setItems(prev => prev.map(r => (r.id === id ? { ...r, ...partial, updatedAt: Date.now() } : r)));
  }
  function del(id: string) { setItems(prev => prev.filter(r => r.id !== id)); }
  function dup(id: string) {
    setItems(prev => {
      const src = prev.find(r => r.id === id);
      if (!src) return prev;
      const now = Date.now();
      return [{ ...src, id: uid("rem"), title: `${src.title} (copy)`, createdAt: now, updatedAt: now }, ...prev];
    });
  }
  function resetSeeds() {
    const now = Date.now();
    setItems(SEEDS.map(s => ({ ...s, id: uid("rem"), createdAt: now, updatedAt: now })));
  }

  return (
    <div className="grid gap-[var(--space-3)]">
      <SectionCard className="card-neo-soft">
        <SectionCard.Header sticky topClassName={GOALS_STICKY_TOP_CLASS}>
          {/* header row (no Quick Add here anymore) */}
          <div className="flex flex-wrap items-center gap-[var(--space-2)] sm:gap-[var(--space-3)] w-full">
            {/* search */}
            <div className="relative flex-1 min-w-[calc(var(--space-8)*3.5)]">
              <Search
                aria-hidden
                className="icon-md pointer-events-none absolute left-[var(--space-4)] top-1/2 -translate-y-1/2 text-muted-foreground opacity-70"
              />
              <Input
                aria-label="Search reminders"
                placeholder="Search title, text, tags…"
                name="search-reminders"
                height="md"
                indent
                value={searchInput}
                onChange={handleSearchChange}
              >
                <span className="pointer-events-none absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-label font-medium tracking-[0.02em] text-muted-foreground">
                  {filtered.length}
                </span>
              </Input>
            </div>

            {/* groups */}
            <TabBar
              items={GROUP_TABS.map(t => ({ key: String(t.key), label: t.label }))}
              value={String(group)}
              onValueChange={(k) => setGroup((k === "all" ? "all" : k) as Group | "all")}
              size="md"
              ariaLabel="Group filter"
              linkPanels={false}
            />

            {/* pinned */}
            <SegmentedButton
              className="min-h-[var(--control-h-md)]"
              onClick={() => setOnlyPinned(v => !v)}
              aria-pressed={onlyPinned}
              title="Pinned only"
              selected={onlyPinned}
            >
              {onlyPinned ? <PinOff className="mr-[var(--space-1)]" /> : <Pin className="mr-[var(--space-1)]" />}
              {onlyPinned ? "Pinned only" : "Any pin"}
            </SegmentedButton>

            {/* actions */}
            <SegmentedButton
              className="min-h-[var(--control-h-md)]"
              onClick={resetSeeds}
              title="Replace with curated seeds"
            >
              Reset
            </SegmentedButton>
          </div>
        </SectionCard.Header>

        {/* Panel body now holds Quick Add + neon quote + cards grid */}
        <SectionCard.Body className="grid gap-[var(--space-3)]">
          {/* Quick Add row (in the SAME panel as cards) */}
          <div className="sm:p-[var(--space-4)] flex items-center gap-[var(--space-4)]">
            <Input
              aria-label="Quick add"
              placeholder={`Quick add to ${group === "all" ? "Pre-Game" : group.charAt(0).toUpperCase() + group.slice(1)}…`}
              name="quick-reminder"
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuick(); } }}
              className="flex-1"
            />
            <IconButton title="Add quick" aria-label="Add quick" onClick={addQuick} size="md" variant="primary">
              <Plus />
            </IconButton>
            <p className="text-label sm:text-ui font-medium tracking-[0.02em] italic text-muted-foreground">
              Stop procrastinating, do it now if you have time
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid card-neo-soft gap-[var(--space-3)] sm:gap-[var(--space-4)] md:grid-cols-12">
            {filtered.map((r) => (
              <div key={r.id} className="md:col-span-6">
                <ReminderCard
                  value={r}
                  onChange={(p) => patch(r.id, p)}
                  onDelete={() => del(r.id)}
                  onDuplicate={() => dup(r.id)}
                />
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-ui font-medium text-muted-foreground">
                Nothing here. Add one or relax your filters.
              </p>
            )}
          </div>
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}

/* ---------- Card ---------- */

function ReminderCard({
  value,
  onChange,
  onDelete,
  onDuplicate,
}: {
  value: Reminder;
  onChange: (partial: Partial<Reminder>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(value.title);
  const [body, setBody] = React.useState(value.body ?? "");
  const [tagsText, setTagsText] = React.useState(value.tags.join(", "));
  const titleRef = React.useRef<HTMLInputElement | null>(null);

  useAutoFocus({ ref: titleRef, when: editing });

  function save() {
    const cleanTags = tagsText.split(",").map(t => t.trim()).filter(Boolean);
    onChange({ title: title.trim() || "Untitled", body: body.trim(), tags: cleanTags });
    setEditing(false);
  }
  function cancel() {
    setTitle(value.title); setBody(value.body ?? ""); setTagsText(value.tags.join(", ")); setEditing(false);
  }

  const trimmedEditingTitle = title.trim();
  const currentTitle = trimmedEditingTitle || value.title.trim() || "Untitled reminder";
  const deleteLabel = `Delete ${currentTitle}`;
  const duplicateLabel = `Duplicate ${currentTitle}`;
  const saveLabel = `Save ${currentTitle}`;
  const cancelLabel = `Cancel ${currentTitle}`;

  return (
    <article className="card-neo rounded-card p-[var(--space-4)] sm:p-[var(--space-5)] relative">
      {value.pinned && (
        <span aria-hidden className="absolute inset-y-[var(--space-3)] left-0 w-0.5 rounded-full bg-primary/55" />
      )}

      <div className="flex items-center justify-between gap-[var(--space-2)] mb-[var(--space-2)]">
        {editing ? (
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            aria-label="Title"
            className="font-semibold"
          />
        ) : (
          <div className="flex items-center gap-[var(--space-2)] min-w-0">
            <h3 className="font-semibold title-glow truncate" title={value.title}>
              {value.title}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              aria-label={value.title ? `Edit reminder ${value.title}` : "Edit reminder"}
              className="shrink-0"
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
        )}

        <div className="card-neo flex items-center gap-[var(--space-1)]">
          <IconButton
            title={value.pinned ? "Unpin" : "Pin"}
            aria-label={value.pinned ? "Unpin" : "Pin"}
            onClick={() => onChange({ pinned: !value.pinned })}
            size="sm"
            iconSize="sm"
          >
            {value.pinned ? <PinOff /> : <Pin />}
          </IconButton>
          <IconButton
            title={duplicateLabel}
            aria-label={duplicateLabel}
            onClick={onDuplicate}
            size="sm"
            iconSize="sm"
          >
            <Copy />
          </IconButton>
          {editing ? (
            <>
              <IconButton
                title={`${saveLabel} (Enter)`}
                aria-label={saveLabel}
                onClick={save}
                size="sm"
                iconSize="sm"
              >
                <Check />
              </IconButton>
              <IconButton
                title={`${cancelLabel} (Esc)`}
                aria-label={cancelLabel}
                onClick={cancel}
                size="sm"
                iconSize="sm"
              >
                <X />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                title={deleteLabel}
                aria-label={deleteLabel}
                onClick={onDelete}
                size="sm"
                iconSize="sm"
              >
                <Trash2 />
              </IconButton>
            </>
          )}
        </div>
      </div>

      <div className="space-y-[var(--space-3)]">
        {editing ? (
          <>
            <Textarea
              aria-label="Body"
              placeholder="Short, skimmable sentence. Keep it actionable."
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
              textareaClassName="min-h-24"
            />
            <Input
              aria-label="Tags (comma separated)"
              placeholder="tags, comma, separated"
              value={tagsText}
              onChange={(e) => setTagsText(e.currentTarget.value)}
            />
            <div className="select-neo-wrap">
              <select
                className="select-neo"
                value={value.group}
                onChange={(e) => onChange({ group: e.currentTarget.value as Group })}
                aria-label="Category"
              >
                <option value="pregame">Pre-Game</option>
                <option value="laning">Laning</option>
                <option value="trading">Trading</option>
                <option value="tempo">Tempo</option>
                <option value="review">Review</option>
                <option value="quick">Quick (pinned)</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {value.body ? (
              <p className="text-ui font-medium leading-6 text-muted-foreground">{value.body}</p>
            ) : (
              <p className="text-ui font-medium text-muted-foreground/80">No text. Click to edit.</p>
            )}
            <div className="flex flex-wrap items-center gap-[var(--space-2)] pt-[var(--space-1)]">
              {value.tags.map((t) => <span key={t} className="pill">{t}</span>)}
              <Badge size="sm" tone="neutral" className="opacity-75">{value.group}</Badge>
              <Badge
                size="sm"
                tone={
                  value.source === "MLA" ? "primary"
                  : value.source === "BLA" ? "accent"
                  : value.source === "BrokenByConcept" ? "top"
                  : "neutral"
                }
              >
                {value.source}
              </Badge>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
