import { addDays, fromISODate, toISODate, formatWeekDay, shortDate } from "../date";

export type ISODateString = string;

export type PlannerRecurringFrequency = "daily" | "weekly" | "monthly";

export type PlannerRecurringRule = {
  frequency: PlannerRecurringFrequency;
  interval: number;
  daysOfWeek?: number[];
  ordinal?: number;
};

export type PlannerParseResult = {
  /** Normalised title extracted from the input phrase. */
  title: string;
  /** First occurrence in local ISO format. */
  startDate: ISODateString;
  /** Optional start time in 24-hour HH:MM. */
  time?: string;
  /** Recurrence rule derived from the phrase. */
  recurrence?: PlannerRecurringRule;
  /** Ordered list of upcoming occurrences (ISO dates). */
  occurrences: ISODateString[];
  /** Confidence score between 0 and 1. */
  confidence: number;
};

export type PlannerRecurringTemplate = {
  id: string;
  label: string;
  description: string;
  occurrences: ISODateString[];
};

type ParserOptions = {
  referenceDate?: Date | string;
  fallbackISO?: ISODateString;
  maxOccurrences?: number;
};

const DEFAULT_OCCURRENCE_COUNT = 4;

const WEEKDAY_MAP: Record<string, number> = {
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
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const MONTH_MAP: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const ORDINAL_MAP: Record<string, number> = {
  first: 1,
  "1st": 1,
  second: 2,
  "2nd": 2,
  third: 3,
  "3rd": 3,
  fourth: 4,
  "4th": 4,
  fifth: 5,
  "5th": 5,
};

type Segment = {
  start: number;
  end: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function normaliseReference({
  referenceDate,
  fallbackISO,
}: ParserOptions): Date {
  if (referenceDate instanceof Date) {
    return new Date(referenceDate);
  }
  if (typeof referenceDate === "string") {
    const parsed = fromISODate(referenceDate) ?? new Date(referenceDate);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }
  if (fallbackISO) {
    const parsed = fromISODate(fallbackISO);
    if (parsed) return parsed;
  }
  return new Date();
}

const removeSegments = (source: string, segments: Segment[]): string => {
  if (!segments.length) return source.trim();
  const sorted = [...segments].sort((a, b) => b.start - a.start);
  let result = source;
  for (const segment of sorted) {
    result =
      result.slice(0, segment.start) + result.slice(segment.end, result.length);
  }
  return result.trim();
};

const pushSegment = (segments: Segment[], start: number, length: number) => {
  if (length <= 0) return;
  segments.push({ start, end: start + length });
};

const findWeekdayMatches = (
  lower: string,
): Array<{ match: string; weekday: number; start: number; end: number }> => {
  const results: Array<{ match: string; weekday: number; start: number; end: number }> = [];
  const pattern = /\b(monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat|sunday|sun)\b/g;
  for (const match of lower.matchAll(pattern)) {
    const weekday = WEEKDAY_MAP[match[1]];
    if (typeof weekday !== "number") continue;
    const index = match.index ?? 0;
    results.push({
      match: match[0],
      weekday,
      start: index,
      end: index + match[0].length,
    });
  }
  return results;
};

const parseTime = (
  input: string,
  lower: string,
  segments: Segment[],
): { time?: string; confidence: number } => {
  let confidence = 0;
  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/;
  const match = lower.match(timeRegex);
  if (match && match.index !== undefined) {
    const hours = Number.parseInt(match[1], 10);
    const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
    if (hours >= 0 && hours <= 12 && minutes >= 0 && minutes < 60) {
      const isPm = match[3] === "pm";
      const normalizedHours = hours % 12 + (isPm ? 12 : 0);
      const time = `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      pushSegment(segments, match.index, match[0].length);
      confidence += 0.2;
      return { time, confidence };
    }
  }

  const keywords: Record<string, string> = {
    noon: "12:00",
    midnight: "00:00",
    morning: "09:00",
    afternoon: "14:00",
    evening: "18:00",
    tonight: "20:00",
  };

  for (const [keyword, value] of Object.entries(keywords)) {
    const idx = lower.indexOf(keyword);
    if (idx >= 0) {
      pushSegment(segments, idx, keyword.length);
      confidence += 0.1;
      return { time: value, confidence };
    }
  }

  return { time: undefined, confidence: 0 };
};

const nextWeekday = (
  reference: Date,
  weekday: number,
  allowSameDay = false,
): Date => {
  const result = new Date(reference);
  const current = result.getDay();
  let offset = (weekday - current + 7) % 7;
  if (offset === 0 && !allowSameDay) {
    offset = 7;
  }
  result.setDate(result.getDate() + offset);
  return result;
};

const parseExplicitDate = (
  lower: string,
  segments: Segment[],
  reference: Date,
): Date | null => {
  const monthPattern =
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/;
  const match = lower.match(monthPattern);
  if (!match || match.index === undefined) return null;
  const month = MONTH_MAP[match[1]];
  if (typeof month !== "number") return null;
  const day = Number.parseInt(match[2], 10);
  if (!Number.isFinite(day) || day <= 0 || day > 31) return null;
  const year = match[3] ? Number.parseInt(match[3], 10) : reference.getFullYear();
  const candidate = new Date(reference);
  candidate.setFullYear(year, month, day);
  candidate.setHours(0, 0, 0, 0);
  if (!Number.isFinite(candidate.getTime())) return null;
  if (!match[3] && candidate < reference) {
    candidate.setFullYear(year + 1);
  }
  pushSegment(segments, match.index, match[0].length);
  return candidate;
};

const parseRelativeDate = (
  lower: string,
  segments: Segment[],
  reference: Date,
): Date | null => {
  const relativePatterns: Array<{
    regex: RegExp;
    offset: number;
  }> = [
    { regex: /\bday after tomorrow\b/, offset: 2 },
    { regex: /\btomorrow\b/, offset: 1 },
    { regex: /\btoday\b/, offset: 0 },
  ];
  for (const { regex, offset } of relativePatterns) {
    const match = lower.match(regex);
    if (match && match.index !== undefined) {
      pushSegment(segments, match.index, match[0].length);
      const next = addDays(reference, offset);
      next.setHours(0, 0, 0, 0);
      return next;
    }
  }

  const inDaysMatch = lower.match(/\bin\s+(\d{1,3})\s+days?\b/);
  if (inDaysMatch && inDaysMatch.index !== undefined) {
    const offset = Number.parseInt(inDaysMatch[1], 10);
    if (Number.isFinite(offset)) {
      pushSegment(segments, inDaysMatch.index, inDaysMatch[0].length);
      const next = addDays(reference, offset);
      next.setHours(0, 0, 0, 0);
      return next;
    }
  }

  return null;
};

const describeRecurrence = (rule: PlannerRecurringRule | undefined): string | null => {
  if (!rule) return null;
  if (rule.frequency === "daily") {
    return rule.interval > 1
      ? `Every ${rule.interval} days`
      : "Daily";
  }
  if (rule.frequency === "weekly") {
    if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
      return "Weekly";
    }
    const labels = rule.daysOfWeek
      .slice()
      .sort()
      .map((weekday) => {
        const fakeDate = new Date(2024, 0, 7 + weekday);
        return formatWeekDay(toISODate(fakeDate));
      });
    const text = labels.join(" · ");
    return rule.interval > 1 ? `Every ${rule.interval} weeks · ${text}` : `Weekly · ${text}`;
  }
  if (rule.frequency === "monthly") {
    if (rule.ordinal && rule.daysOfWeek?.length === 1) {
      const ordinalLabel = Object.entries(ORDINAL_MAP).find(
        ([, value]) => value === rule.ordinal,
      )?.[0];
      const ordinal = ordinalLabel
        ? ordinalLabel.replace(/\d+(st|nd|rd|th)/, (match) => match)
        : `#${rule.ordinal}`;
      const fakeDate = new Date(2024, 0, 7 + (rule.daysOfWeek[0] ?? 0));
      return `${ordinal} ${formatWeekDay(toISODate(fakeDate))} each month`;
    }
    return "Monthly";
  }
  return null;
};

const generateOccurrences = (
  start: Date,
  rule: PlannerRecurringRule | undefined,
  count: number,
): ISODateString[] => {
  const safeCount = Math.max(1, count);
  const occurrences: ISODateString[] = [];
  if (!rule) {
    occurrences.push(toISODate(start));
    return occurrences;
  }

  const addOccurrence = (date: Date) => {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    occurrences.push(toISODate(clone));
  };

  if (rule.frequency === "daily") {
    for (let i = 0; i < safeCount; i += 1) {
      const date = addDays(start, i * Math.max(1, rule.interval));
      addOccurrence(date);
    }
    return occurrences;
  }

  if (rule.frequency === "weekly") {
    const days = (rule.daysOfWeek && rule.daysOfWeek.length
      ? [...new Set(rule.daysOfWeek)]
      : [start.getDay()]
    ).sort((a, b) => a - b);
    let cursor = new Date(start);
    while (occurrences.length < safeCount) {
      const day = cursor.getDay();
      if (days.includes(day) && cursor >= start) {
        addOccurrence(cursor);
      }
      cursor = addDays(cursor, 1);
    }
    return occurrences;
  }

  if (rule.frequency === "monthly") {
    const ordinal = rule.ordinal ?? 1;
    const dayOfWeek = rule.daysOfWeek?.[0] ?? start.getDay();
    let cursor = new Date(start);
    let produced = 0;
    while (produced < safeCount) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      let weekCount = 0;
      for (let i = 0; i < 31; i += 1) {
        const candidate = addDays(monthStart, i);
        if (candidate.getMonth() !== monthStart.getMonth()) {
          break;
        }
        if (candidate.getDay() === dayOfWeek) {
          weekCount += 1;
          if (weekCount === ordinal && candidate >= start) {
            addOccurrence(candidate);
            produced += 1;
            break;
          }
        }
      }
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      cursor.setHours(0, 0, 0, 0);
    }
    return occurrences;
  }

  occurrences.push(toISODate(start));
  return occurrences;
};

const sanitiseTitle = (raw: string): string => {
  const withoutConnectors = raw
    .replace(/\b(on|at|every|each|next|this|for|the|a|an)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutConnectors || raw.trim();
};

const toDisplayDate = (iso: ISODateString): string => {
  try {
    const label = formatWeekDay(iso);
    return label;
  } catch {
    return iso;
  }
};

const toDisplayDateLong = (iso: ISODateString): string => {
  try {
    const dt = fromISODate(iso);
    if (!dt) return iso;
    return shortDate.format(dt);
  } catch {
    return iso;
  }
};

export function parsePlannerPhrase(
  phrase: string,
  options: ParserOptions = {},
): PlannerParseResult | null {
  const trimmed = phrase.trim();
  if (!trimmed) return null;

  const reference = normaliseReference(options);
  reference.setHours(0, 0, 0, 0);

  const lower = trimmed.toLowerCase();
  const segments: Segment[] = [];
  let workingDate: Date | null = null;
  let recurrence: PlannerRecurringRule | undefined;
  let confidence = 0.4;

  const { time, confidence: timeConfidence } = parseTime(trimmed, lower, segments);
  confidence += timeConfidence;

  const weekdayMatches = findWeekdayMatches(lower);
  const explicitDate = parseExplicitDate(lower, segments, reference);
  const relativeDate = parseRelativeDate(lower, segments, reference);

  if (explicitDate) {
    workingDate = explicitDate;
    confidence += 0.25;
  } else if (relativeDate) {
    workingDate = relativeDate;
    confidence += 0.2;
  }

  const recurrenceHandlers: Array<() => void> = [
    () => {
      const dailyMatch = lower.match(/\b(daily|every\s+day|each\s+day)\b/);
      if (dailyMatch && dailyMatch.index !== undefined) {
        recurrence = { frequency: "daily", interval: 1 };
        pushSegment(segments, dailyMatch.index, dailyMatch[0].length);
        confidence += 0.25;
      }
    },
    () => {
      const weekdaysMatch = lower.match(/\b(each|every)\s+weekdays?\b/);
      if (weekdaysMatch && weekdaysMatch.index !== undefined) {
        recurrence = { frequency: "weekly", interval: 1, daysOfWeek: [1, 2, 3, 4, 5] };
        pushSegment(segments, weekdaysMatch.index, weekdaysMatch[0].length);
        confidence += 0.25;
      }
    },
    () => {
      const weeklyMatch = lower.match(/\b(weekly|every\s+week)\b/);
      if (weeklyMatch && weeklyMatch.index !== undefined) {
        const baseDay = workingDate ? workingDate.getDay() : reference.getDay();
        recurrence = { frequency: "weekly", interval: 1, daysOfWeek: [baseDay] };
        pushSegment(segments, weeklyMatch.index, weeklyMatch[0].length);
        confidence += 0.2;
      }
    },
    () => {
      const multiDayRegex = /\bevery\s+((?:monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat|sunday|sun)(?:\s*(?:,|and)\s*(?:monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat|sunday|sun))*)/;
      const match = lower.match(multiDayRegex);
      if (match && match.index !== undefined) {
        const daysText = match[1];
        const days: number[] = [];
        for (const token of daysText.split(/\s*(?:,|and)\s*/)) {
          const weekday = WEEKDAY_MAP[token];
          if (typeof weekday === "number" && !days.includes(weekday)) {
            days.push(weekday);
          }
        }
        if (days.length) {
          recurrence = { frequency: "weekly", interval: 1, daysOfWeek: days };
          pushSegment(segments, match.index, match[0].length);
          confidence += 0.3;
          if (!workingDate) {
            const firstDay = days[0]!;
            workingDate = nextWeekday(reference, firstDay, true);
          }
        }
      }
    },
    () => {
      const monthlyRegex = /\bevery\s+(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th)\s+(monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat|sunday|sun)\b/;
      const match = lower.match(monthlyRegex);
      if (match && match.index !== undefined) {
        const ordinal = ORDINAL_MAP[match[1]];
        const weekday = WEEKDAY_MAP[match[2]];
        if (ordinal && typeof weekday === "number") {
          recurrence = {
            frequency: "monthly",
            interval: 1,
            ordinal,
            daysOfWeek: [weekday],
          };
          pushSegment(segments, match.index, match[0].length);
          confidence += 0.3;
          if (!workingDate) {
            const start = nextWeekday(reference, weekday, true);
            start.setDate(1);
            start.setMonth(reference.getMonth());
            workingDate = start;
          }
        }
      }
    },
  ];

  recurrenceHandlers.forEach((handler) => {
    if (!recurrence) {
      handler();
    }
  });

  if (!workingDate) {
    if (weekdayMatches.length && !recurrence) {
      const next = nextWeekday(reference, weekdayMatches[0]!.weekday, true);
      workingDate = next;
      pushSegment(segments, weekdayMatches[0]!.start, weekdayMatches[0]!.match.length);
      confidence += 0.2;
    } else if (!weekdayMatches.length && recurrence?.frequency === "weekly" && recurrence.daysOfWeek?.length) {
      workingDate = nextWeekday(reference, recurrence.daysOfWeek[0]!, true);
    } else {
      workingDate = reference;
    }
  }

  const start = new Date(workingDate);
  start.setHours(0, 0, 0, 0);

  const maxOccurrences = options.maxOccurrences ?? DEFAULT_OCCURRENCE_COUNT;
  const occurrences = generateOccurrences(start, recurrence, maxOccurrences);
  const baseTitle = removeSegments(trimmed, segments);
  const title = sanitiseTitle(baseTitle);
  const normalizedTitle = title || trimmed;

  return {
    title: normalizedTitle,
    startDate: toISODate(start),
    time,
    recurrence,
    occurrences,
    confidence: clamp(confidence, 0, 1),
  };
}

export function buildRecurringTemplates(
  result: PlannerParseResult,
  { maxOccurrences = DEFAULT_OCCURRENCE_COUNT }: { maxOccurrences?: number } = {},
): PlannerRecurringTemplate[] {
  if (!result.recurrence) return [];
  const occurrences = result.occurrences.slice(0, maxOccurrences);
  if (occurrences.length <= 1) return [];

  const templates: PlannerRecurringTemplate[] = [];
  const recurrenceLabel = describeRecurrence(result.recurrence);
  const summary = recurrenceLabel ?? "Recurring";

  templates.push({
    id: "single",
    label: `Next on ${toDisplayDate(occurrences[0]!)}`,
    description: `Schedule only the next occurrence (${toDisplayDateLong(occurrences[0]!)}).`,
    occurrences: [occurrences[0]!],
  });

  if (occurrences.length >= 2) {
    templates.push({
      id: "two",
      label: "Next two",
      description: `Capture the next two ${summary.toLowerCase()}.`,
      occurrences: occurrences.slice(0, 2),
    });
  }

  if (occurrences.length >= 3) {
    templates.push({
      id: "three",
      label: "Next three",
      description: `Plan ahead for the next three ${summary.toLowerCase()}.`,
      occurrences: occurrences.slice(0, 3),
    });
  }

  return templates;
}
