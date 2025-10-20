import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RemindersProvider,
  useReminders,
  type Reminder,
} from "@/components/goals/reminders/useReminders";

const STORE_KEY = "goals.reminders.v4";
const DOMAIN_KEY = "goals.reminders.domain.v2";
const GROUP_KEY = "goals.reminders.group.v1";
const SOURCE_KEY = "goals.reminders.source.v1";

const persistentState = new Map<string, unknown>();
let seedCounter = 0;

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  let uidCounter = 0;
  return {
    ...actual,
    usePersistentState: <T,>(
      key: string,
      initial: T,
      options?: {
        decode?: (value: unknown) => T | null | undefined;
        encode?: (value: T) => unknown;
      },
    ) => {
      const decode = options?.decode;
      const encode = options?.encode;
      const [state, setState] = React.useState<T>(() => {
        if (persistentState.has(key)) {
          const stored = persistentState.get(key);
          if (decode) {
            const decoded = decode(stored);
            if (typeof decoded !== "undefined" && decoded !== null) {
              return decoded;
            }
          } else {
            return stored as T;
          }
        } else {
          persistentState.set(key, initial);
        }
        return initial;
      });

      const setStateAndCache: React.Dispatch<React.SetStateAction<T>> = (
        value,
      ) => {
        setState((prev) => {
          const next =
            typeof value === "function"
              ? (value as (prevState: T) => T)(prev)
              : value;
          const encoded = encode ? encode(next) : next;
          persistentState.set(key, encoded as unknown);
          return next;
        });
      };

      return [state, setStateAndCache] as const;
    },
    uid: () => {
      uidCounter += 1;
      return `rem-${uidCounter}`;
    },
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RemindersProvider>{children}</RemindersProvider>
);

function seedBaseState() {
  persistentState.set(STORE_KEY, []);
  persistentState.set(DOMAIN_KEY, "League");
  persistentState.set(GROUP_KEY, "quick");
  persistentState.set(SOURCE_KEY, "all");
}

function createReminder(overrides: Partial<Reminder>): Reminder {
  seedCounter += 1;
  const now = 1_700_000_000_000 + seedCounter;
  return {
    id: overrides.id ?? `seed-${seedCounter}`,
    title: overrides.title ?? `Reminder ${seedCounter}`,
    body: overrides.body ?? "",
    tags: overrides.tags ?? [],
    source: overrides.source ?? "Custom",
    group: overrides.group ?? "quick",
    domain: overrides.domain,
    pinned: overrides.pinned,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  } as Reminder;
}

describe("useReminders", () => {
  beforeEach(() => {
    persistentState.clear();
    seedCounter = 0;
    seedBaseState();
  });

  it("prevents quick add duplicates and surfaces an error", () => {
    const { result } = renderHook(() => useReminders(), { wrapper: Wrapper });

    let added = true;
    act(() => {
      added = result.current.addReminder("Duplicate cue");
    });

    expect(added).toBe(true);
    expect(result.current.quickAddError).toBeNull();
    expect(result.current.items).toHaveLength(1);

    let secondAdded = true;
    act(() => {
      result.current.setQuickAdd("Duplicate cue");
      secondAdded = result.current.addReminder("Duplicate cue");
    });

    expect(secondAdded).toBe(false);
    expect(result.current.quickAddError).toBe("Reminder already exists.");
    expect(result.current.items).toHaveLength(1);
  });

  it("returns all life reminders regardless of the stored group", () => {
    const lifeReminders = [
      createReminder({
        id: "life-1",
        title: "Rest",
        domain: "Life",
        group: "quick",
        updatedAt: 10,
      }),
      createReminder({
        id: "life-2",
        title: "Hydrate",
        domain: "Life",
        group: "tempo",
        updatedAt: 20,
      }),
    ];
    persistentState.set(STORE_KEY, lifeReminders);
    persistentState.set(DOMAIN_KEY, "Life");
    persistentState.set(GROUP_KEY, "quick");

    const { result } = renderHook(() => useReminders(), { wrapper: Wrapper });

    expect(result.current.filtered).toHaveLength(2);
    const ids = result.current.filtered.map((reminder) => reminder.id);
    expect(new Set(ids)).toEqual(new Set(["life-1", "life-2"]));
  });

  it("generates a unique title when creating default reminders", () => {
    const { result } = renderHook(() => useReminders(), { wrapper: Wrapper });

    act(() => {
      result.current.addReminder();
      result.current.addReminder();
    });

    const titles = result.current.items.map((reminder) => reminder.title);
    expect(titles).toContain("New reminder");
    expect(titles).toContain("New reminder (2)");
    expect(result.current.quickAddError).toBeNull();
  });

  it("sanitizes invalid persisted filters and retains reminders", async () => {
    const reminders = [
      createReminder({
        id: "league-quick-1",
        title: "League Quick",
        domain: "League",
        group: "quick",
      }),
      createReminder({
        id: "learn-laning-1",
        title: "Learn Laning",
        domain: "Learn",
        group: "laning",
      }),
    ];
    persistentState.set(STORE_KEY, reminders);
    persistentState.set(DOMAIN_KEY, "invalid-domain");
    persistentState.set(GROUP_KEY, "bad-group");
    persistentState.set(SOURCE_KEY, "bad-source");

    const { result } = renderHook(() => useReminders(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.domain).toBe("League");
      expect(result.current.group).toBe("quick");
      expect(result.current.source).toBe("all");
    });

    await waitFor(() => {
      expect(result.current.filtered.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(persistentState.get(DOMAIN_KEY)).toBe("League");
      expect(persistentState.get(GROUP_KEY)).toBe("quick");
      expect(persistentState.get(SOURCE_KEY)).toBe("all");
    });
  });
});
