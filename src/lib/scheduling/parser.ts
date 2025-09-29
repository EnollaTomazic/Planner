import { addDays, fromISODate, toISODate } from "@/lib/date";
import type { ISODate } from "@/components/planner";

type PlannerEventIntent = "task" | "project";

export type PlannerRecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type PlannerRecurringRule = {
  frequency: PlannerRecurringFrequency;
  interval: number;
  weekdays?: number[];
};

export type PlannerEventDraft = {
  title: string;
  startDate?: ISODate;
  time?: string;
};

export type PlannerParseConfidence = "none" | "low" | "medium" | "high";

export type PlannerParseMatch = {
  time?: string;
  date?: string;
  recurrence?: string[];
  intent?: PlannerEventIntent;
};

export type PlannerParseResult = {
  intent: PlannerEventIntent;
  event: PlannerEventDraft;
  recurrence: PlannerRecurringRule | null;
  confidence: PlannerParseConfidence;
  matched: PlannerParseMatch;
};

export type ParsePlannerPhraseOptions = {
  now?: Date;
};

type Span = { start: number; end: number };

const TIME_REGEX = /\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/;
const INTENT_PREFIX_REGEX = /^(?:create\s+)?(?:new\s+)?project[:\s]/;

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const RELATIVE_DATE_TOKENS: Record<string, number> = {
  today: 0,
  tonight: 0,
  tomorrow: 1,
  "day after tomorrow": 2,
};

function clampConfidence(
  current: PlannerParseConfidence,
  next: PlannerParseConfidence,
): PlannerParseConfidence {
  const order: PlannerParseConfidence[] = ["none", "low", "medium", "high"];
  return order[Math.max(order.indexOf(current), order.indexOf(next))];
}

function normaliseTimeToken(match: RegExpExecArray): string | undefined {
  const hour = Number.parseInt(match[1] ?? "", 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return undefined;
  const rawMinutes = match[2];
  const suffix = match[3];
  const hasSuffix = typeof suffix === "string" && suffix.length > 0;
  const hasMinutes = typeof rawMinutes === "string" && rawMinutes.length > 0;
  if (!hasSuffix && !hasMinutes) return undefined;
  const minutes = hasMinutes ? Number.parseInt(rawMinutes, 10) : 0;
  if (minutes < 0 || minutes > 59) return undefined;
  let normalizedHour = hour;
  if (suffix) {
    const lowerSuffix = suffix.toLowerCase();
    if (lowerSuffix === "am") {
      if (hour === 12) normalizedHour = 0;
    } else if (lowerSuffix === "pm") {
      if (hour < 12) normalizedHour = hour + 12;
    }
  }
  const hh = String(normalizedHour).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

function addSpan(spans: Span[], start: number, length: number) {
  if (start < 0 || length <= 0) return;
  spans.push({ start, end: start + length });
}

function mergeSpans(spans: Span[]): Span[] {
  if (!spans.length) return spans;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const result: Span[] = [];
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    const span = sorted[i];
    if (span.start <= current.end) {
      current = { start: current.start, end: Math.max(current.end, span.end) };
    } else {
      result.push(current);
      current = span;
    }
  }
  result.push(current);
  return result;
}

function stripSpans(value: string, spans: Span[]): string {
  if (!spans.length) return value.trim();
  const merged = mergeSpans(spans);
  let cursor = 0;
  let output = "";
  for (const span of merged) {
    if (cursor < span.start) {
      output += value.slice(cursor, span.start);
    }
    cursor = span.end;
  }
  if (cursor < value.length) {
    output += value.slice(cursor);
  }
  return output.replace(/\s{2,}/g, " ").replace(/[\s,]+$/g, "").trim();
}

function computeRelativeDate(base: Date, offset: number): Date {
  const next = new Date(base);
  next.setHours(0, 0, 0, 0);
  return addDays(next, offset);
}

function nextWeekday(base: Date, weekday: number, includeToday = false): Date {
  const target = new Date(base);
  target.setHours(0, 0, 0, 0);
  const currentWeekday = target.getDay();
  let delta = weekday - currentWeekday;
  if (delta < 0 || (!includeToday && delta === 0)) {
    delta += 7;
  }
  if (delta === 0 && !includeToday) {
    delta = 7;
  }
  return addDays(target, delta);
}

function parseMonthDate(
  descriptor: string,
  base: Date,
): { date: Date; token: string } | null {
  const trimmed = descriptor.replace(/,/g, " ").trim();
  if (!trimmed) return null;
  const [head] = trimmed.split(/\s+(?:at|by|from|starting|around|before|after)\b/i);
  const normalized = head.trim().replace(/\s+/g, " ");
  const monthMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (monthMatch) {
    const monthIndex = Number.parseInt(monthMatch[1] ?? "", 10) - 1;
    const day = Number.parseInt(monthMatch[2] ?? "", 10);
    const yearToken = monthMatch[3];
    if (Number.isNaN(monthIndex) || Number.isNaN(day) || monthIndex < 0) {
      return null;
    }
    const date = new Date(base);
    const year = yearToken
      ? Number.parseInt(yearToken.length === 2 ? `20${yearToken}` : yearToken, 10)
      : base.getFullYear();
    date.setFullYear(year, monthIndex, day);
    date.setHours(0, 0, 0, 0);
    if (date.getMonth() !== monthIndex || date.getDate() !== day) {
      return null;
    }
    return { date, token: monthMatch[0] ?? normalized };
  }

  const words = normalized.toLowerCase().split(/\s+/);
  if (!words.length) return null;
  const maybeMonth = MONTHS[words[0]];
  if (maybeMonth === undefined) return null;
  const dayValue = words[1];
  if (!dayValue) return null;
  const day = Number.parseInt(dayValue, 10);
  if (Number.isNaN(day) || day <= 0 || day > 31) return null;
  const yearValue = words[2];
  const date = new Date(base);
  const year = yearValue
    ? Number.parseInt(yearValue.length === 2 ? `20${yearValue}` : yearValue, 10)
    : base.getFullYear();
  date.setFullYear(year, maybeMonth, day);
  date.setHours(0, 0, 0, 0);
  if (date.getMonth() !== maybeMonth || date.getDate() !== day) {
    return null;
  }
  if (!yearValue && date < base) {
    date.setFullYear(year + 1);
  }
  const tokenWords = words.slice(0, yearValue ? 3 : 2).join(" ");
  return { date, token: tokenWords };
}

function normaliseWeekdays(token: string): number[] {
  const lowerToken = token.toLowerCase();
  if (lowerToken.includes("weekday")) {
    return [1, 2, 3, 4, 5];
  }
  if (lowerToken.includes("weekend")) {
    return [0, 6];
  }
  const matches = token.match(
    /(?:mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)/g,
  );
  if (!matches) return [];
  const result = new Set<number>();
  for (const match of matches) {
    const mapped = WEEKDAYS[match.replace(/[^a-z]/gi, "").toLowerCase()];
    if (mapped !== undefined) {
      result.add(mapped);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export function parsePlannerPhrase(
  phrase: string,
  options: ParsePlannerPhraseOptions = {},
): PlannerParseResult {
  const raw = phrase ?? "";
  const value = raw.trim();
  const now = options.now ? new Date(options.now) : new Date();
  if (!value) {
    return {
      intent: "task",
      event: { title: "" },
      recurrence: null,
      confidence: "none",
      matched: {},
    };
  }

  const lower = value.toLowerCase();
  const spans: Span[] = [];
  const matched: PlannerParseMatch = {};
  let intent: PlannerEventIntent = "task";
  let confidence: PlannerParseConfidence = "low";
  let recurrence: PlannerRecurringRule | null = null;
  let startDate: ISODate | undefined;
  let eventTime: string | undefined;

  const timeRegex = new RegExp(TIME_REGEX, "gi");
  while (true) {
    const candidate = timeRegex.exec(lower);
    if (!candidate) break;
    const normalized = normaliseTimeToken(candidate);
    if (normalized) {
      eventTime = normalized;
      confidence = clampConfidence(confidence, "medium");
      const start = candidate.index ?? 0;
      addSpan(spans, start, candidate[0]?.length ?? 0);
      matched.time = normalized;
      break;
    }
  }

  for (const [token, offset] of Object.entries(RELATIVE_DATE_TOKENS)) {
    const index = lower.indexOf(token);
    if (index >= 0) {
      const date = computeRelativeDate(now, offset);
      startDate = toISODate(date);
      confidence = clampConfidence(confidence, "medium");
      addSpan(spans, index, token.length);
      matched.date = token;
      break;
    }
  }

  if (!startDate) {
    const nextMatch = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (nextMatch?.index !== undefined) {
      const weekday = WEEKDAYS[nextMatch[1] ?? ""];
      if (weekday !== undefined) {
        const date = nextWeekday(now, weekday, false);
        startDate = toISODate(date);
        addSpan(spans, nextMatch.index, nextMatch[0]?.length ?? 0);
        matched.date = nextMatch[0] ?? nextMatch[1];
        confidence = clampConfidence(confidence, "medium");
      }
    }
  }

  if (!startDate) {
    const thisMatch = lower.match(/\b(?:this|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (thisMatch?.index !== undefined) {
      const weekday = WEEKDAYS[thisMatch[1] ?? ""];
      if (weekday !== undefined) {
        const date = nextWeekday(now, weekday, true);
        startDate = toISODate(date);
        addSpan(spans, thisMatch.index, thisMatch[0]?.length ?? 0);
        matched.date = thisMatch[0] ?? thisMatch[1];
        confidence = clampConfidence(confidence, "medium");
      }
    }
  }

  if (!startDate) {
    const explicitMatch = lower.match(/\bon\s+([^]+)$/);
    if (explicitMatch?.index !== undefined && explicitMatch[1]) {
      const parsed = parseMonthDate(explicitMatch[1].trim(), now);
      if (parsed) {
        startDate = toISODate(parsed.date);
        const removalLength = (`on ${parsed.token}`).length;
        addSpan(spans, explicitMatch.index, removalLength);
        matched.date = startDate;
        confidence = clampConfidence(confidence, "high");
      }
    }
  }

  if (INTENT_PREFIX_REGEX.test(lower)) {
    intent = "project";
    const match = lower.match(INTENT_PREFIX_REGEX);
    if (match?.index !== undefined) {
      addSpan(spans, match.index, match[0]?.length ?? 0);
      matched.intent = "project";
      confidence = clampConfidence(confidence, "medium");
    }
  }

  if (intent === "task") {
    const projectCue = lower.match(/\bproject\s+(?:named\s+)?([\w\s]+)$/);
    if (projectCue?.index !== undefined) {
      const label = projectCue[0] ?? "project";
      addSpan(spans, projectCue.index, label.length);
      matched.intent = "task";
    }
  }

  const recurrenceMatches: string[] = [];

  const registerRecurrence = (
    rule: PlannerRecurringRule,
    token?: string,
    priority: PlannerParseConfidence = "medium",
  ) => {
    if (!recurrence) {
      recurrence = rule;
    }
    const label = token?.trim();
    if (label && !recurrenceMatches.includes(label)) {
      recurrenceMatches.push(label);
    }
    confidence = clampConfidence(confidence, priority);
  };

  const weekdayMatch = lower.match(/\bweekday(?:s)?\b/);
  if (weekdayMatch?.index !== undefined) {
    registerRecurrence(
      { frequency: "weekly", interval: 1, weekdays: [1, 2, 3, 4, 5] },
      weekdayMatch[0] ?? "weekdays",
      "high",
    );
    addSpan(spans, weekdayMatch.index, weekdayMatch[0]?.length ?? 0);
  }

  const weekendMatch = lower.match(/\bweekend(?:s)?\b/);
  if (weekendMatch?.index !== undefined) {
    registerRecurrence(
      { frequency: "weekly", interval: 1, weekdays: [0, 6] },
      weekendMatch[0] ?? "weekends",
      "high",
    );
    addSpan(spans, weekendMatch.index, weekendMatch[0]?.length ?? 0);
  }

  const everyMatch = lower.match(/\b(?:every|each)\s+([^,.]+)(?=[$\s,.])/);
  if (everyMatch?.index !== undefined && everyMatch[1]) {
    const descriptor = everyMatch[1].trim();
    const weekdays = normaliseWeekdays(descriptor);
    if (weekdays.length) {
      registerRecurrence(
        { frequency: "weekly", interval: 1, weekdays },
        everyMatch[0] ?? descriptor,
        "high",
      );
    } else {
      const intervalMatch = descriptor.match(/(\d+)?\s*(day|week|month|year)s?/);
      if (intervalMatch) {
        const interval = Number.parseInt(intervalMatch[1] ?? "1", 10) || 1;
        const unit = intervalMatch[2];
        if (unit === "day") {
          registerRecurrence(
            { frequency: "daily", interval },
            everyMatch[0] ?? descriptor,
            "high",
          );
        } else if (unit === "week") {
          registerRecurrence(
            { frequency: "weekly", interval },
            everyMatch[0] ?? descriptor,
            "high",
          );
        } else if (unit === "month") {
          registerRecurrence(
            { frequency: "monthly", interval },
            everyMatch[0] ?? descriptor,
            "high",
          );
        } else if (unit === "year") {
          registerRecurrence(
            { frequency: "yearly", interval },
            everyMatch[0] ?? descriptor,
            "high",
          );
        }
      }
    }
    addSpan(spans, everyMatch.index, (everyMatch[0] ?? "").length);
  }

  const dailyMatch = lower.match(/\b(?:daily|every\s+day|each\s+day)\b/);
  if (dailyMatch?.index !== undefined) {
    registerRecurrence({ frequency: "daily", interval: 1 }, dailyMatch[0] ?? "daily", "high");
    addSpan(spans, dailyMatch.index, dailyMatch[0]?.length ?? 0);
  }

  if (!recurrence) {
    const weeklyMatch = lower.match(/\bweekly\b/);
    if (weeklyMatch?.index !== undefined) {
      registerRecurrence({ frequency: "weekly", interval: 1 }, weeklyMatch[0] ?? "weekly");
      addSpan(spans, weeklyMatch.index, weeklyMatch[0]?.length ?? 0);
    }
  }

  if (!recurrence) {
    const monthlyMatch = lower.match(/\bmonthly\b/);
    if (monthlyMatch?.index !== undefined) {
      registerRecurrence({ frequency: "monthly", interval: 1 }, monthlyMatch[0] ?? "monthly");
      addSpan(spans, monthlyMatch.index, monthlyMatch[0]?.length ?? 0);
    }
  }

  if (!recurrence) {
    const yearlyMatch = lower.match(/\byearly\b/);
    if (yearlyMatch?.index !== undefined) {
      registerRecurrence({ frequency: "yearly", interval: 1 }, yearlyMatch[0] ?? "yearly");
      addSpan(spans, yearlyMatch.index, yearlyMatch[0]?.length ?? 0);
    }
  }

  const title = stripSpans(value, spans) || value;
  if (!matched.intent) {
    matched.intent = intent;
  }
  if (recurrenceMatches.length) {
    matched.recurrence = recurrenceMatches;
  }
  if (startDate && !matched.date) {
    matched.date = startDate;
  }

  return {
    intent,
    event: {
      title,
      ...(startDate ? { startDate } : {}),
      ...(eventTime ? { time: eventTime } : {}),
    },
    recurrence,
    confidence,
    matched,
  };
}

function toSafeDate(iso?: ISODate, fallback?: Date): Date {
  const parsed = iso ? fromISODate(iso) : null;
  if (parsed) return parsed;
  return fallback ? new Date(fallback) : new Date();
}

export type BuildOccurrencesOptions = {
  startDate?: ISODate;
  now?: Date;
  count?: number;
};

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  const desiredMonth = next.getMonth() + months;
  next.setMonth(desiredMonth);
  return next;
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function buildRecurringOccurrences(
  rule: PlannerRecurringRule,
  options: BuildOccurrencesOptions = {},
): ISODate[] {
  const { startDate, now, count = 3 } = options;
  const base = toSafeDate(startDate, now);
  base.setHours(0, 0, 0, 0);
  const occurrences: ISODate[] = [];

  if (rule.frequency === "daily") {
    const interval = Math.max(1, rule.interval);
    for (let i = 0; i < count; i += 1) {
      const date = addDays(base, i * interval);
      occurrences.push(toISODate(date));
    }
    return occurrences;
  }

  if (rule.frequency === "weekly") {
    const interval = Math.max(1, rule.interval);
    const weekdays = rule.weekdays && rule.weekdays.length
      ? [...rule.weekdays].sort((a, b) => a - b)
      : [base.getDay()];
    const start = new Date(base);
    let dayCursor = new Date(start);
    let iterations = 0;
    while (occurrences.length < count && iterations < 366) {
      const diff = Math.floor((dayCursor.getTime() - start.getTime()) / 86400000);
      const weekOffset = Math.floor(diff / 7);
      const inInterval = weekOffset % interval === 0;
      if (inInterval && weekdays.includes(dayCursor.getDay())) {
        occurrences.push(toISODate(dayCursor));
      }
      dayCursor = addDays(dayCursor, 1);
      iterations += 1;
    }
    return occurrences;
  }

  if (rule.frequency === "monthly") {
    const interval = Math.max(1, rule.interval);
    for (let i = 0; i < count; i += 1) {
      const date = addMonths(base, i * interval);
      occurrences.push(toISODate(date));
    }
    return occurrences;
  }

  if (rule.frequency === "yearly") {
    const interval = Math.max(1, rule.interval);
    for (let i = 0; i < count; i += 1) {
      const date = addYears(base, i * interval);
      occurrences.push(toISODate(date));
    }
    return occurrences;
  }

  return occurrences;
}

export function summariseParse(result: PlannerParseResult): string {
  const parts: string[] = [];
  if (result.matched.intent) {
    parts.push(result.matched.intent === "project" ? "Project" : "Task");
  }
  if (result.event.time) {
    parts.push(`at ${result.event.time}`);
  }
  if (result.event.startDate) {
    parts.push(`on ${result.event.startDate}`);
  }
  if (result.recurrence) {
    parts.push(
      result.recurrence.frequency === "weekly" && result.recurrence.weekdays?.length
        ? `weekly (${result.recurrence.weekdays.join(",")})`
        : `${result.recurrence.frequency} x${result.recurrence.interval}`,
    );
  }
  return parts.join(" • ");
}
