// src/components/goals/TimerTab.tsx
"use client";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import Hero from "@/components/ui/layout/Hero";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import TimerRing from "./TimerRing";
import DurationSelector from "./DurationSelector";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  BookOpen,
  Brush,
  Code2,
  User,
} from "lucide-react";
import { removeLocal, usePersistentState, readLocal } from "@/lib/db";
import { formatMmSs, parseMmSs } from "@/lib/date";
import { clamp } from "@/lib/utils";

/* profiles */
type ProfileKey = "study" | "clean" | "code" | "custom";
type Profile = {
  key: ProfileKey;
  label: string;
  icon: React.ReactNode;
  defaultMin: number;
};
const PROFILES: Profile[] = [
  {
    key: "study",
    label: "Studying",
    icon: <BookOpen className="mr-[var(--space-1)]" />,
    defaultMin: 45,
  },
  {
    key: "clean",
    label: "Cleaning",
    icon: <Brush className="mr-[var(--space-1)]" />,
    defaultMin: 30,
  },
  {
    key: "code",
    label: "Coding",
    icon: <Code2 className="mr-[var(--space-1)]" />,
    defaultMin: 60,
  },
  {
    key: "custom",
    label: "Custom",
    icon: <User className="mr-[var(--space-1)]" />,
    defaultMin: 25,
  },
];

type TimerState = {
  profile: ProfileKey;
  customMinutes: number;
  remaining: number;
  running: boolean;
};

const PROFILE_LOOKUP = PROFILES.reduce(
  (acc, profile) => {
    acc[profile.key] = profile;
    return acc;
  },
  {} as Record<ProfileKey, Profile>,
);

const TIMER_STATE_KEY = "goals.timer.state.v1";
const LEGACY_KEYS = {
  profile: "goals.timer.profile.v1",
  customMinutes: "goals.timer.customMin.v1",
  remaining: "goals.timer.remaining.v1",
  running: "goals.timer.running.v1",
} as const;

const DEFAULT_PROFILE: ProfileKey = "study";
const DEFAULT_CUSTOM_MINUTES = 25;

function getProfile(key: ProfileKey): Profile {
  return PROFILE_LOOKUP[key] ?? PROFILES[0];
}

function getMinutesForProfile(key: ProfileKey, customMinutes: number) {
  return key === "custom" ? customMinutes : getProfile(key).defaultMin;
}

const DEFAULT_TIMER_STATE: TimerState = {
  profile: DEFAULT_PROFILE,
  customMinutes: DEFAULT_CUSTOM_MINUTES,
  remaining:
    getMinutesForProfile(DEFAULT_PROFILE, DEFAULT_CUSTOM_MINUTES) * 60_000,
  running: false,
};

function isProfileKey(value: string): value is ProfileKey {
  return value in PROFILE_LOOKUP;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/* helpers */

const ADJUST_BTN_CLASS =
  "absolute top-[var(--space-2)] sm:-top-[var(--space-4)] rounded-full bg-background/40 backdrop-blur shadow-[var(--shadow-glow-md)] transition-transform duration-[var(--dur-quick)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring";

export default function TimerTab() {
  const [timer, setTimer] = usePersistentState<TimerState>(
    TIMER_STATE_KEY,
    DEFAULT_TIMER_STATE,
  );
  const { profile, customMinutes, remaining, running } = timer;

  React.useEffect(() => {
    const stored = readLocal<TimerState>(TIMER_STATE_KEY);
    if (stored !== null) return;

    const legacyProfile = readLocal<ProfileKey>(LEGACY_KEYS.profile);
    const legacyCustom = readLocal<number>(LEGACY_KEYS.customMinutes);
    const legacyRemaining = readLocal<number>(LEGACY_KEYS.remaining);
    const legacyRunning = readLocal<boolean>(LEGACY_KEYS.running);

    if (
      legacyProfile == null &&
      legacyCustom == null &&
      legacyRemaining == null &&
      legacyRunning == null
    ) {
      return;
    }

    const nextProfile =
      typeof legacyProfile === "string" && isProfileKey(legacyProfile)
        ? legacyProfile
        : DEFAULT_TIMER_STATE.profile;
    const nextCustomMinutes = isFiniteNumber(legacyCustom)
      ? legacyCustom
      : DEFAULT_TIMER_STATE.customMinutes;
    const fallbackMinutes =
      nextProfile === "custom"
        ? nextCustomMinutes
        : getProfile(nextProfile).defaultMin;
    const nextRemaining = isFiniteNumber(legacyRemaining)
      ? legacyRemaining
      : fallbackMinutes * 60_000;
    const nextRunning =
      typeof legacyRunning === "boolean"
        ? legacyRunning
        : DEFAULT_TIMER_STATE.running;

    setTimer({
      profile: nextProfile,
      customMinutes: nextCustomMinutes,
      remaining: nextRemaining,
      running: nextRunning,
    });

    removeLocal(LEGACY_KEYS.profile);
    removeLocal(LEGACY_KEYS.customMinutes);
    removeLocal(LEGACY_KEYS.remaining);
    removeLocal(LEGACY_KEYS.running);
  }, [setTimer]);

  const profileDef = React.useMemo(
    () => getProfile(profile),
    [profile],
  );
  const isCustom = profile === "custom";
  const minutes = isCustom ? customMinutes : profileDef.defaultMin;

  // remaining time
  const prevProfile = React.useRef<ProfileKey>(profile);
  // Reset timer when switching profiles
  React.useEffect(() => {
    if (prevProfile.current === profile) return;
    prevProfile.current = profile;
    const nextRemaining =
      (profile === "custom" ? customMinutes : profileDef.defaultMin) * 60_000;
    setTimer((prev) => {
      if (!prev.running && prev.remaining === nextRemaining) return prev;
      return {
        ...prev,
        running: false,
        remaining: nextRemaining,
      };
    });
  }, [profile, customMinutes, profileDef.defaultMin, setTimer]);

  // edit mode for mm:ss
  const [timeEdit, setTimeEdit] = React.useState(
    () => formatMmSs(remaining, { unit: "milliseconds", padMinutes: true }),
  );
  React.useEffect(() => {
    setTimeEdit(formatMmSs(remaining, { unit: "milliseconds", padMinutes: true }));
  }, [remaining]);

  // tick loop
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      let shouldStop = false;
      setTimer((prev) => {
        if (prev.remaining <= 0) {
          if (!prev.running) return prev;
          shouldStop = true;
          return {
            ...prev,
            running: false,
          };
        }
        const nextRemaining = prev.remaining - 250;
        if (nextRemaining <= 0) {
          shouldStop = true;
          return {
            ...prev,
            remaining: 0,
            running: false,
          };
        }
        return {
          ...prev,
          remaining: nextRemaining,
        };
      });
      if (shouldStop) {
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, setTimer]);

  // adjust minutes for custom
  function adjust(delta: number) {
    if (!isCustom) return;
    if (running) return;
    const next = clamp(minutes + delta, 0, 180);
    setTimer((prev) => {
      if (prev.customMinutes === next) return prev;
      const secs = Math.floor((prev.remaining % 60_000) / 1000);
      return {
        ...prev,
        customMinutes: next,
        remaining: next * 60_000 + secs * 1000,
      };
    });
  }

  const start = React.useCallback(() => {
    setTimer((prev) => {
      const target = prev.remaining <= 0 ? minutes * 60_000 : prev.remaining;
      if (prev.running && target === prev.remaining) return prev;
      return {
        ...prev,
        running: true,
        remaining: target,
      };
    });
  }, [minutes, setTimer]);
  const pause = React.useCallback(() => {
    setTimer((prev) => {
      if (!prev.running) return prev;
      return {
        ...prev,
        running: false,
      };
    });
  }, [setTimer]);
  const reset = React.useCallback(() => {
    setTimer((prev) => {
      const target = minutes * 60_000;
      if (!prev.running && prev.remaining === target) return prev;
      return {
        ...prev,
        running: false,
        remaining: target,
      };
    });
  }, [minutes, setTimer]);
  function commitEdit() {
    if (!isCustom || running) return;
    const ms = parseMmSs(timeEdit, { unit: "milliseconds" });
    if (ms == null) {
      setTimeEdit(
        formatMmSs(remaining, { unit: "milliseconds", padMinutes: true }),
      );
      return;
    }
    const mm = Math.floor(ms / 60_000),
      ss = Math.floor((ms % 60_000) / 1000);
    setTimer((prev) => {
      const nextRemaining = mm * 60_000 + ss * 1000;
      if (prev.customMinutes === mm && prev.remaining === nextRemaining)
        return prev;
      return {
        ...prev,
        customMinutes: mm,
        remaining: nextRemaining,
      };
    });
  }

  const totalMs = minutes * 60_000;
  const progress = Math.max(
    0,
    Math.min(1, 1 - remaining / Math.max(1, totalMs)),
  );
  const finished = remaining <= 0;

  // Tab items map
  const tabItems = React.useMemo(
    () =>
      PROFILES.map((p) => ({
        key: p.key,
        label: (
          <span className="inline-flex items-center">
            {p.icon}
            {p.label}
          </span>
        ),
      })),
    [],
  );

  // Right slot content for Custom: quick duration chips + custom time field
  const rightSlot = isCustom ? (
    <div className="flex items-center flex-wrap gap-[var(--space-2)]">
      <DurationSelector
        value={minutes}
        onChange={(m) => {
          if (running) return;
          setTimer((prev) => {
            const nextRemaining = m * 60_000;
            if (prev.customMinutes === m && prev.remaining === nextRemaining)
              return prev;
            return {
              ...prev,
              customMinutes: m,
              remaining: nextRemaining,
            };
          });
        }}
        disabled={running}
      />
      <input
        aria-label="Custom minutes and seconds"
        value={timeEdit}
        onChange={(e) => setTimeEdit(e.currentTarget.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => e.key === "Enter" && commitEdit()}
        placeholder="mm:ss"
        disabled={running}
        className="w-[5ch] rounded-full border border-border/20 bg-background/20 px-[var(--space-2)] text-center text-ui font-medium backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="text"
      />
    </div>
  ) : null;

  // keyboard shortcuts
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === " ") {
        e.preventDefault();
        if (running) pause();
        else start();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (isCustom && !running && /^[1-6]$/.test(e.key)) {
        const opts = [10, 15, 20, 25, 30, 45];
        const idx = Number(e.key) - 1;
        const m = opts[idx];
        if (m != null) {
          setTimer((prev) => {
            const nextRemaining = m * 60_000;
            if (prev.customMinutes === m && prev.remaining === nextRemaining)
              return prev;
            return {
              ...prev,
              customMinutes: m,
              remaining: nextRemaining,
            };
          });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, isCustom, pause, start, reset, setTimer]);

  const pct = Math.round(progress * 100);

  return (
    <>
      <Hero
        frame={false}
        eyebrow="Focus"
        heading="Timer"
        subtitle="Pick a duration and focus."
        subTabs={{
          items: tabItems,
          value: profile,
          onChange: (k: string) =>
            setTimer((prev) => {
              const next = k as ProfileKey;
              if (prev.profile === next) return prev;
              return {
                ...prev,
                profile: next,
              };
            }),
          size: "md",
          align: "between",
          ariaLabel: "Timer profiles",
          right: rightSlot,
          showBaseline: true,
          className: "overflow-x-auto",
        }}
      />

      <SectionCard className="no-hover">
        <SectionCard.Body>
          <div className="relative mx-auto flex w-full max-w-[calc(var(--space-8)*6)] flex-col items-stretch p-[var(--space-8)]">
            {/* plus/minus */}
            <IconButton
              aria-label="Minus 1 minute"
              title="Minus 1 minute"
              onClick={() => adjust(-1)}
              disabled={!isCustom || running || minutes <= 0}
              className={`${ADJUST_BTN_CLASS} left-[var(--space-2)] sm:-left-[var(--space-4)]`}
            >
              <Minus />
            </IconButton>
            <IconButton
              aria-label="Plus 1 minute"
              title="Plus 1 minute"
              onClick={() => adjust(1)}
              disabled={!isCustom || running}
              className={`${ADJUST_BTN_CLASS} right-[var(--space-2)] sm:-right-[var(--space-4)]`}
            >
              <Plus />
            </IconButton>

            {/* ring + digits */}
            <div
              className="group relative mx-auto flex aspect-square w-full max-w-[min(calc(var(--space-8)*3.5),calc(var(--viewport-width)-var(--space-8)))] items-center justify-center"
            >
              <TimerRing pct={pct} className="size-full" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-title font-semibold tabular-nums text-foreground drop-shadow-[0_0_var(--space-2)_hsl(var(--neon-soft))] transition-transform duration-[var(--dur-quick)] group-hover:translate-y-0.5 sm:text-title-lg">
                  {formatMmSs(remaining, {
                    unit: "milliseconds",
                    padMinutes: true,
                  })}
                </div>
                {isCustom && !running && (
                  <input
                    aria-label="Edit minutes and seconds"
                    value={timeEdit}
                    onChange={(e) => setTimeEdit(e.currentTarget.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                    className="absolute w-full max-w-[calc(var(--space-7)*3.5)] rounded-full bg-transparent text-center text-title font-semibold tabular-nums opacity-0 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-title-lg"
                  />
                )}
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-[var(--space-6)] w-full">
              <div className="relative h-[var(--space-2)] w-full rounded-full bg-background/20 shadow-neo-inset">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_9%,hsl(var(--foreground)/0.15)_9%,hsl(var(--foreground)/0.15)_10%)]" />
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] shadow-[var(--shadow-glow-md)] transition-[width] duration-[var(--dur-quick)] ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-[var(--space-1)] text-right text-label font-medium tracking-[0.02em] text-muted-foreground tabular-nums">
                {pct}%
              </div>
            </div>

            {/* controls */}
            <div className="mt-[var(--space-6)] flex w-full flex-wrap justify-center gap-[var(--space-2)] overflow-x-auto">
              {!running ? (
                <SegmentedButton
                  className="gap-[var(--space-2)]"
                  onClick={start}
                  title="Start"
                >
                  <Play />
                  Start
                </SegmentedButton>
              ) : (
                <SegmentedButton
                  className="gap-[var(--space-2)]"
                  onClick={pause}
                  title="Pause"
                  selected
                >
                  <Pause />
                  Pause
                </SegmentedButton>
              )}
              <SegmentedButton
                className="gap-[var(--space-2)]"
                onClick={reset}
                title="Reset"
              >
                <RotateCcw />
                Reset
              </SegmentedButton>
            </div>

            {/* Complete state */}
            {finished && (
              <div className="mt-[var(--space-6)] grid place-items-center">
                <div className="rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)/0.35),hsl(var(--accent-2)/0.35)))] px-[var(--space-3)] py-[var(--space-1)] text-ui font-medium text-foreground shadow-[var(--shadow-glow-md)] ring-1 ring-inset ring-border/50 motion-safe:animate-pulse motion-reduce:animate-none">
                  Complete
                </div>
                <div className="mt-[var(--space-2)] text-label font-medium tracking-[0.02em] text-muted-foreground">
                  Good. Now do the review, not Twitter.
                </div>
              </div>
            )}
          </div>
        </SectionCard.Body>
      </SectionCard>
    </>
  );
}
