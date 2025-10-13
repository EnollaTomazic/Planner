"use client";

import * as React from "react";
import { uid, usePersistentState } from "@/lib/db";

export type Domain = "Life" | "League" | "Learn";
export type Source = "MLA" | "BLA" | "BrokenByConcept" | "Custom";
export type Group = "quick" | "pregame" | "laning" | "trading" | "tempo" | "review";

export type Reminder = {
  id: string;
  title: string;
  body?: string;
  tags: string[];
  source: Source;
  group: Group;
  pinned?: boolean;
  domain?: Domain;
  createdAt: number;
  updatedAt: number;
};

const STORE_KEY = "goals.reminders.v4";

function createReminder(
  title: string,
  body: string,
  tags: string[],
  source: Source,
  group: Group,
  pinned = false,
  domain?: Domain,
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
    domain,
    createdAt: now,
    updatedAt: now,
  };
}

const SEEDS: Reminder[] = [
  createReminder(
    "Hit 2 first",
    "Push 3 melees → step up or respect if losing push.",
    [],
    "BLA",
    "quick",
    true,
    "Learn",
  ),
  createReminder(
    "Jungle start check",
    "Track start → first gank lane → second spawn prio.",
    [],
    "BrokenByConcept",
    "quick",
    true,
    "Learn",
  ),
  createReminder(
    "3-wave plan",
    "Say it: slow then crash 3 OR hold then thin/freeze.",
    [],
    "MLA",
    "pregame",
    false,
    "League",
  ),
  createReminder(
    "Ward 2:30",
    "River/tri at 2:30. Sweep before shove.",
    [],
    "BrokenByConcept",
    "pregame",
    false,
    "Learn",
  ),
  createReminder(
    "Space with casters",
    "Trade when your casters live; back off on enemy wave.",
    [],
    "MLA",
    "laning",
    false,
    "League",
  ),
  createReminder(
    "CD punish",
    "Trade on enemy cooldown gaps; track sums.",
    [],
    "MLA",
    "trading",
    false,
    "League",
  ),
  createReminder(
    "Good recall",
    "Shove → recall on spike → arrive first to river.",
    [],
    "BrokenByConcept",
    "tempo",
    false,
    "Learn",
  ),
  createReminder(
    "Death audit",
    "Wave, vision, jungle, greed. Name the fix.",
    [],
    "BLA",
    "review",
    false,
    "Learn",
  ),
];

export const GROUPS: Array<{ key: Group; label: string; hint?: string }> = [
  { key: "quick", label: "Quick", hint: "Pin-worthy" },
  { key: "pregame", label: "Pre-Game", hint: "Before queue" },
  { key: "laning", label: "Laning", hint: "Wave & trades" },
  { key: "trading", label: "Trading", hint: "Windows & sums" },
  { key: "tempo", label: "Tempo", hint: "Recall & prio" },
  { key: "review", label: "Review", hint: "After game" },
];

const SOURCE_FILTERS = [
  "all",
  "MLA",
  "BLA",
  "BrokenByConcept",
  "Custom",
] as const;

export type SourceFilter = (typeof SOURCE_FILTERS)[number];

const SOURCE_TABS = SOURCE_FILTERS.map((s) => ({
  key: s,
  label: s === "all" ? "All" : s,
}));

const normalizeTitle = (value: string) => value.trim().toLowerCase();

function makeUniqueTitle(base: string, reminders: Reminder[]) {
  let suffix = 2;
  let candidate = `${base} (${suffix})`;
  while (
    reminders.some(
      (reminder) => normalizeTitle(reminder.title) === normalizeTitle(candidate),
    )
  ) {
    suffix += 1;
    candidate = `${base} (${suffix})`;
  }
  return candidate;
}

export type RemindersContextValue = {
  items: Reminder[];
  filtered: Reminder[];
  counts: Record<Group, number>;
  domain: Domain;
  setDomain: (value: Domain) => void;
  group: Group;
  setGroup: (value: Group) => void;
  source: SourceFilter;
  setSource: (value: SourceFilter) => void;
  query: string;
  setQuery: (value: string) => void;
  onlyPinned: boolean;
  setOnlyPinned: (value: boolean) => void;
  quickAdd: string;
  setQuickAdd: (value: string) => void;
  quickAddError: string | null;
  clearQuickAddError: () => void;
  setQuickAddError: (message: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  addReminder: (initialTitle?: string) => boolean;
  updateReminder: (id: string, partial: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  toggleFilters: () => void;
  togglePinned: () => void;
  showGroups: boolean;
  neonClass: string;
  groupTabs: Array<{ key: Group; label: string; badge: number }>;
  sourceTabs: typeof SOURCE_TABS;
  groups: typeof GROUPS;
};

export const RemindersContext = React.createContext<RemindersContextValue | null>(
  null,
);

function inferDomain(reminder: Reminder): Domain {
  if (reminder.domain) return reminder.domain;
  return reminder.source === "BLA" || reminder.source === "BrokenByConcept"
    ? "Learn"
    : "League";
}

// Consolidated domain filtering so derived selectors share the same logic.
function filterRemindersByDomain(
  reminders: Reminder[],
  domain: Domain,
): Reminder[] {
  return reminders.filter((reminder) => inferDomain(reminder) === domain);
}

function useRemindersState(): RemindersContextValue {
  const [items, setItems] = usePersistentState<Reminder[]>(STORE_KEY, SEEDS);
  const [query, setQuery] = React.useState("");
  const [onlyPinned, setOnlyPinned] = React.useState(false);
  const [domain, setDomain] = usePersistentState<Domain>(
    "goals.reminders.domain.v2",
    "League",
  );
  const [group, setGroup] = usePersistentState<Group>(
    "goals.reminders.group.v1",
    "quick",
  );
  const [source, setSource] = usePersistentState<SourceFilter>(
    "goals.reminders.source.v1",
    "all",
  );
  const [quickAdd, setQuickAdd] = React.useState("");
  const [quickAddError, setQuickAddErrorState] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const showGroups = domain === "League" || domain === "Learn";

  const domainItems = React.useMemo(
    () => filterRemindersByDomain(items, domain),
    [items, domain],
  );

  const clearQuickAddError = React.useCallback(() => {
    setQuickAddErrorState(null);
  }, [setQuickAddErrorState]);

  const reportQuickAddError = React.useCallback(
    (message: string) => {
      setQuickAddErrorState(message);
    },
    [setQuickAddErrorState],
  );

  const counts = React.useMemo(() => {
    return domainItems.reduce(
      (acc, reminder) => {
        acc[reminder.group] = (acc[reminder.group] ?? 0) + 1;
        return acc;
      },
      {
        quick: 0,
        pregame: 0,
        laning: 0,
        trading: 0,
        tempo: 0,
        review: 0,
      } as Record<Group, number>,
    );
  }, [domainItems]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return domainItems
      .filter((reminder) => (showGroups ? reminder.group === group : true))
      .filter((reminder) => (source === "all" ? true : reminder.source === source))
      .filter((reminder) => (onlyPinned ? reminder.pinned : true))
      .filter((reminder) => {
        if (!q) return true;
        const haystack = [
          reminder.title,
          reminder.body ?? "",
          reminder.tags.join(" "),
          reminder.source,
          reminder.group,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (!!b.pinned === !!a.pinned) return b.updatedAt - a.updatedAt;
        return Number(b.pinned) - Number(a.pinned);
      });
  }, [domainItems, group, source, onlyPinned, query, showGroups]);

  const addReminder = React.useCallback(
    (initialTitle?: string) => {
      let added = false;
      setItems((prev) => {
        const now = Date.now();
        const baseTitle = (initialTitle ?? "New reminder").trim() || "New reminder";
        const domainScoped = filterRemindersByDomain(prev, domain);
        const hasDuplicate = domainScoped.some(
          (reminder) => normalizeTitle(reminder.title) === normalizeTitle(baseTitle),
        );

        if (hasDuplicate && initialTitle) {
          reportQuickAddError("Reminder already exists.");
          setQuickAdd((prevValue) => prevValue.trim());
          return prev;
        }

        const title = hasDuplicate
          ? makeUniqueTitle(baseTitle, domainScoped)
          : baseTitle;

        const next: Reminder = {
          id: uid("rem"),
          title,
          body: "",
          tags: [],
          source: domain === "Learn" ? "BLA" : "Custom",
          group,
          domain,
          pinned: group === "quick",
          createdAt: now,
          updatedAt: now,
        };

        clearQuickAddError();
        added = true;
        return [next, ...prev];
      });
      if (added) {
        setQuickAdd("");
      }
      return added;
    },
    [domain, group, setItems, setQuickAdd, clearQuickAddError, reportQuickAddError],
  );

  const updateReminder = React.useCallback(
    (id: string, partial: Partial<Reminder>) => {
      setItems((prev) =>
        prev.map((reminder) =>
          reminder.id === id
            ? { ...reminder, ...partial, updatedAt: Date.now() }
            : reminder,
        ),
      );
    },
    [setItems],
  );

  const removeReminder = React.useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((reminder) => reminder.id !== id));
    },
    [setItems],
  );

  const toggleFilters = React.useCallback(() => {
    setShowFilters((prev) => !prev);
  }, [setShowFilters]);

  const togglePinned = React.useCallback(() => {
    setOnlyPinned((prev) => !prev);
  }, [setOnlyPinned]);

  const neonClass = domain === "Life" ? "neon-life" : "neon-primary";

  const groupTabs = React.useMemo(
    () => GROUPS.map((groupItem) => ({
      key: groupItem.key,
      label: groupItem.label,
      badge: counts[groupItem.key],
    })),
    [counts],
  );

  return React.useMemo(
    () => ({
      items,
      filtered,
      counts,
      domain,
      setDomain,
      group,
      setGroup,
      source,
      setSource,
      query,
      setQuery,
      onlyPinned,
      setOnlyPinned,
      quickAdd,
      setQuickAdd,
      quickAddError,
      clearQuickAddError,
      setQuickAddError: reportQuickAddError,
      showFilters,
      setShowFilters,
      addReminder,
      updateReminder,
      removeReminder,
      toggleFilters,
      togglePinned,
      showGroups,
      neonClass,
      groupTabs,
      sourceTabs: SOURCE_TABS,
      groups: GROUPS,
    }),
    [
      items,
      filtered,
      counts,
      domain,
      setDomain,
      group,
      setGroup,
      source,
      setSource,
      query,
      setQuery,
      onlyPinned,
      setOnlyPinned,
      quickAdd,
      setQuickAdd,
      quickAddError,
      clearQuickAddError,
      reportQuickAddError,
      showFilters,
      setShowFilters,
      addReminder,
      updateReminder,
      removeReminder,
      toggleFilters,
      togglePinned,
      showGroups,
      neonClass,
      groupTabs,
    ],
  );
}

type RemindersProviderProps = {
  children: React.ReactNode;
};

export function RemindersProvider({ children }: RemindersProviderProps) {
  const value = useRemindersState();
  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const context = React.useContext(RemindersContext);
  if (!context) {
    throw new Error("useReminders must be used within a RemindersProvider");
  }
  return context;
}

