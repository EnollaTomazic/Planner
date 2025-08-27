// src/components/team/JungleClears.tsx
"use client";
import "../team/style.css";

/**
 * JungleClears
 * - Top filter area uses <Hero2> with pill search and count.
 * - Hint text sits inside the Hero2 body.
 * - Bucket cards are SectionCard-based with big time on the right.
 * - Two cards per row on md+.
 * - Titles and timers now use glitch-title + glitch-flicker + title-glow.
 */

import { useMemo, useState } from "react";
import Hero2 from "@/components/ui/layout/Hero2";
import SectionCard from "@/components/ui/layout/SectionCard";
import { Timer } from "lucide-react";
import { JUNGLE_ROWS, SPEED_HINT, type ClearSpeed } from "./data";

type JunglerRow = (typeof JUNGLE_ROWS)[number];
const BUCKETS: ClearSpeed[] = ["Very Fast", "Fast", "Medium", "Slow"];

const SPEED_PERSONA: Record<ClearSpeed, { tag: string; line: string }> = {
  "Very Fast": { tag: "Zoomies",     line: "Turbo 3-camp pace. Invade timings and double-crab angles are on the table." },
  Fast:        { tag: "Tempo Bully", line: "You hit prio first. Fight on camps, trade up, and push the map." },
  Medium:      { tag: "Stable Path", line: "Play the map, not the stopwatch. Shadow lanes, contest second spawn." },
  Slow:        { tag: "Gank Goblin", line: "Skip races. Stack vision, create angles, flip lanes instead of timers." },
};

const SPEED_TIME: Record<ClearSpeed, string> = {
  "Very Fast": "3:00",
  Fast:       "3:05–3:20",
  Medium:     "3:25–3:40",
  Slow:       "≥3:45",
};

export default function JungleClears() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return JUNGLE_ROWS;
    return JUNGLE_ROWS.filter((r) => {
      const hay = [r.champ, ...(r.type ?? []), r.notes ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const exampleByBucket = useMemo(() => {
    const map = {} as Record<ClearSpeed, string>;
    for (const b of BUCKETS) {
      const row = JUNGLE_ROWS.find((r) => r.speed === b);
      map[b] = row?.champ ?? "-";
    }
    return map;
  }, []);

  return (
    <div data-scope="team" className="grid gap-4 sm:gap-6">
      {/* Top: Hero2 header with pill search (round) */}
      <Hero2
        sticky={false}
        rail
        heading="Clear Speed Buckets"
        dividerTint="primary"
        search={{
          value: query,
          onValueChange: setQuery,
          placeholder: "Filter by champion, type, or note...",
          round: true,
          debounceMs: 80,
          right: <span className="text-xs opacity-80">{filtered.length} shown</span>,
        }}
      >
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          If you’re on a <em>Medium</em> champ, don’t race farm vs <em>Very Fast</em>. Path for fights,
          ganks, or cross-map trades.
        </p>
      </Hero2>

      {/* Buckets */}
      <div className="grid gap-6 md:grid-cols-2">
        {BUCKETS.map((bucket) => {
          const rowsAll = JUNGLE_ROWS.filter((r) => r.speed === bucket);
          const rows = filtered.filter((r) => r.speed === bucket);

          return (
            <SectionCard key={bucket}>
              <SectionCard.Header
                sticky
                title={
                  <div className="flex items-center gap-2">
                    <Timer className="opacity-80" />
                    {/* Glitch title + glow */}
                    <span
                      className="glitch-title glitch-flicker title-glow text-xl sm:text-2xl md:text-3xl font-semibold"
                      data-text={bucket}
                    >
                      {bucket}
                    </span>
                  </div>
                }
                actions={
                  // Big timer: same glitch treatment + glow
                  <span
                    className="glitch-title glitch-flicker title-glow font-mono leading-none text-2xl sm:text-3xl md:text-4xl"
                    data-text={SPEED_TIME[bucket]}
                    aria-label="Expected first-clear timing"
                    title="Expected first-clear timing"
                  >
                    {SPEED_TIME[bucket]}
                  </span>
                }
              />
              <SectionCard.Body>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-0.5 text-[10px] tracking-wide uppercase">
                    {SPEED_PERSONA[bucket].tag}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {SPEED_HINT[bucket]}
                  </span>
                </div>

                {/* Example row (canonical pills) */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-[hsl(var(--muted-foreground))] text-sm">Example:</span>
                  <span className="pill pill-compact text-xs">{exampleByBucket[bucket]}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    ({rowsAll.length} total)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{bucket} junglers with types and notes</caption>
                    <thead className="text-left text-[hsl(var(--muted-foreground))]">
                      <tr className="h-9">
                        <th scope="col" className="pr-3">Champion</th>
                        <th scope="col" className="pr-3">Type</th>
                        <th scope="col" className="pr-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r: JunglerRow) => (
                        <tr
                          key={r.champ}
                          className="h-10 border-t border-[hsl(var(--border))]/40 hover:bg-[hsl(var(--card))/0.45]"
                        >
                          <td className="py-2 pr-3 font-medium">{r.champ}</td>
                          <td className="py-2 pr-3">
                            <div className="flex flex-wrap gap-1.5">
                              {(r.type ?? []).map((t) => (
                                <span key={t} className="pill pill-compact text-xs">{t}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-3">{r.notes ?? "-"}</td>
                        </tr>
                      ))}
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
}
