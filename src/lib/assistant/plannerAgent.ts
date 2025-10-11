import { z } from "zod";

import {
  applyModelSafety,
  enforceTokenBudget,
  guardResponse,
  sanitizePrompt,
  type TokenBudgetContent,
} from "@/ai/safety";
import type { ISODate } from "@/components/planner";
import {
  parsePlannerPhrase,
  summariseParse,
  type PlannerParseConfidence,
} from "@/lib/scheduling";
import {
  recordLlmTokenUsage,
  type LlmAgentMetadata,
} from "@/lib/metrics/llmTokens";

const SYSTEM_PROMPT = [
  "You are Planner, an assistant that helps people organise projects and daily tasks.",
  "Extract actionable planner suggestions from the user's description and keep responses concise.",
  "Prioritise clear wording and surface any detected dates, times, or recurring patterns.",
].join("\n");

const DEFAULT_MAX_TOKENS = 4_000;
const DEFAULT_RESPONSE_RESERVE = 512;
const SAFE_MODE_SUGGESTION_LIMIT = 3;
const DEFAULT_SUGGESTION_LIMIT = 5;

const ENABLED_FLAG_VALUES = new Set(["1", "true", "on", "yes"]);

const AGENT_METADATA: LlmAgentMetadata = {
  id: "planner.assistant",
  label: "Planner Assistant",
  kind: "planner",
};

const plannerAssistantSuggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  intent: z.union([z.literal("task"), z.literal("project")]),
  confidence: z.union([
    z.literal("none"),
    z.literal("low"),
    z.literal("medium"),
    z.literal("high"),
  ]),
  summary: z.string().nullable(),
  schedule: z
    .object({
      date: z.string().optional(),
      time: z.string().optional(),
    })
    .optional(),
});

const plannerAssistantPlanSchema = z.object({
  sanitizedPrompt: z.string(),
  prompt: z.string(),
  summary: z.string().nullable(),
  suggestions: z.array(plannerAssistantSuggestionSchema),
  safety: z.object({
    safeMode: z.boolean(),
    temperature: z.number(),
    toolChoice: z.object({
      mode: z.union([z.literal("auto"), z.literal("none"), z.literal("required")]),
      maxToolCalls: z.number().int().nonnegative().optional(),
    }),
    topP: z.number().optional(),
  }),
  tokenBudget: z.object({
    totalTokens: z.number().int().nonnegative(),
    availableTokens: z.number().int().nonnegative(),
    removedCount: z.number().int().nonnegative(),
  }),
});

export type PlannerAssistantSuggestion = z.infer<
  typeof plannerAssistantSuggestionSchema
>;
export type PlannerAssistantPlan = z.infer<typeof plannerAssistantPlanSchema>;

export const plannerAssistantSuggestionValidator =
  plannerAssistantSuggestionSchema;
export const plannerAssistantPlanValidator = plannerAssistantPlanSchema;

type PlannerAgentMessage = TokenBudgetContent & { role: "system" | "user" };

type PlannerAssistantIntent = "task" | "project";

export type PlannerAssistantOptions = {
  readonly prompt: string;
  readonly now?: Date;
  readonly maxTokens?: number;
  readonly reservedForResponse?: number;
  readonly suggestionLimit?: number;
};

export type PlannerAssistantErrorCode =
  | "empty_prompt"
  | "budget_exhausted"
  | "invalid_plan";

export class PlannerAssistantError extends Error {
  readonly code: PlannerAssistantErrorCode;

  constructor(code: PlannerAssistantErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "PlannerAssistantError";
  }
}

function isSafeModeFlagEnabled(value: string | undefined): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return ENABLED_FLAG_VALUES.has(normalized);
}

function createMessages(prompt: string): PlannerAgentMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
      pinned: true,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}

function extractUserPrompt(messages: readonly PlannerAgentMessage[]): string {
  const userMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user" && message.content.trim().length > 0);

  return userMessage ? userMessage.content.trim() : "";
}

function splitSegments(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  const segments = new Set<string>();
  segments.add(trimmed);

  const candidateLines = trimmed
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\u2022]\s*/, "").trim())
    .filter((line) => line.length > 0);

  for (const line of candidateLines) {
    segments.add(line);
  }

  return Array.from(segments);
}

function toSuggestionId(index: number, title: string): string {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    return `${index}`;
  }
  return `${index}-${normalized}`;
}

function toSchedule(
  date?: ISODate,
  time?: string,
): PlannerAssistantSuggestion["schedule"] {
  if (!date && !time) {
    return undefined;
  }

  return {
    ...(date ? { date } : {}),
    ...(time ? { time } : {}),
  };
}

function synthesiseSuggestion(
  text: string,
  now: Date,
  index: number,
): PlannerAssistantSuggestion {
  const parsed = parsePlannerPhrase(text, { now });
  const title = parsed.event.title.trim() || text;
  const summary = summariseParse(parsed);
  const schedule = toSchedule(parsed.event.startDate, parsed.event.time);

  return {
    id: toSuggestionId(index, `${title}-${schedule?.date ?? ""}-${schedule?.time ?? ""}`),
    title,
    intent: parsed.intent as PlannerAssistantIntent,
    confidence: parsed.confidence,
    summary: summary.length > 0 ? summary : null,
    ...(schedule ? { schedule } : {}),
  } satisfies PlannerAssistantSuggestion;
}

function deduplicateSuggestions(
  suggestions: PlannerAssistantSuggestion[],
): PlannerAssistantSuggestion[] {
  const seen = new Set<string>();
  const result: PlannerAssistantSuggestion[] = [];

  for (const suggestion of suggestions) {
    const key = [
      suggestion.intent,
      suggestion.title.toLowerCase(),
      suggestion.schedule?.date ?? "",
      suggestion.schedule?.time ?? "",
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(suggestion);
  }

  return result;
}

export function planWithAssistant(
  options: PlannerAssistantOptions,
): PlannerAssistantPlan {
  const sanitizedPrompt = sanitizePrompt(options.prompt);
  if (!sanitizedPrompt) {
    throw new PlannerAssistantError(
      "empty_prompt",
      "The planner assistant requires a non-empty prompt.",
    );
  }

  const safety = applyModelSafety();
  const safeModeEnabled =
    safety.safeMode && isSafeModeFlagEnabled(process.env.SAFE_MODE);

  const messages = createMessages(sanitizedPrompt);
  const budget = enforceTokenBudget(messages, {
    maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    reservedForResponse: options.reservedForResponse ?? DEFAULT_RESPONSE_RESERVE,
    agent: AGENT_METADATA,
  });

  const finalPrompt = extractUserPrompt(budget.messages);
  if (!finalPrompt) {
    throw new PlannerAssistantError(
      "budget_exhausted",
      "The planner assistant could not keep the user's prompt within the token budget.",
    );
  }

  recordLlmTokenUsage(AGENT_METADATA, budget.totalTokens);

  const segments = splitSegments(finalPrompt);
  const now = options.now ?? new Date();
  const limit = Math.max(
    1,
    options.suggestionLimit ??
      (safeModeEnabled ? SAFE_MODE_SUGGESTION_LIMIT : DEFAULT_SUGGESTION_LIMIT),
  );

  const rawSuggestions = segments
    .slice(0, limit * 2)
    .map((segment, index) => synthesiseSuggestion(segment, now, index));
  const suggestions = deduplicateSuggestions(rawSuggestions).slice(0, limit);

  if (!suggestions.length) {
    suggestions.push(
      {
        id: toSuggestionId(0, finalPrompt),
        title: finalPrompt,
        intent: "task",
        confidence: "none" satisfies PlannerParseConfidence,
        summary: null,
      },
    );
  }

  const summary = suggestions[0]?.summary ?? null;
  const prompt = [SYSTEM_PROMPT, "", finalPrompt].join("\n");

  const plan = {
    sanitizedPrompt,
    prompt,
    summary,
    suggestions,
    safety: {
      ...safety,
      safeMode: safeModeEnabled,
    },
    tokenBudget: {
      totalTokens: budget.totalTokens,
      availableTokens: budget.availableTokens,
      removedCount: budget.removedCount,
    },
  } satisfies PlannerAssistantPlan;

  const validation = guardResponse(plan, plannerAssistantPlanSchema, {
    label: "planner assistant plan",
  });

  if (!validation.success) {
    throw new PlannerAssistantError(
      "invalid_plan",
      "Planner assistant produced an invalid plan.",
    );
  }

  return validation.data;
}
