"use server";

import { z } from "zod";

import { fromISODate } from "@/lib/date";
import {
  PlannerAssistantError,
  plannerAssistantPlanValidator,
  planWithAssistant,
} from "@/lib/assistant/plannerAgent";

import {
  resolvePlannerAssistantSafeMode,
  type PlannerAssistantSafeModeState,
} from "@/lib/assistant/safe-mode";

export const plannerAssistantRequestSchema = z.object({
  prompt: z.string(),
  focusDate: z.string().optional(),
  suggestionLimit: z.number().int().positive().max(10).optional(),
});

export type PlannerAssistantActionInput = z.input<typeof plannerAssistantRequestSchema>;

export type PlannerAssistantActionSuccess = {
  ok: true;
  plan: z.infer<typeof plannerAssistantPlanValidator>;
  safeMode: PlannerAssistantSafeModeState;
};

export type PlannerAssistantActionError = {
  ok: false;
  error: string;
  message: string;
  safeMode: PlannerAssistantSafeModeState;
  issues?: unknown;
};

export type PlannerAssistantActionResult =
  | PlannerAssistantActionSuccess
  | PlannerAssistantActionError;

function formatValidationIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}

export async function planWithAssistantAction(
  input: PlannerAssistantActionInput,
): Promise<PlannerAssistantActionResult> {
  const safeMode = resolvePlannerAssistantSafeMode();

  if (safeMode.server !== safeMode.client) {
    return {
      ok: false,
      error: "safe_mode_mismatch",
      message:
        "Planner assistant is disabled because SAFE_MODE and NEXT_PUBLIC_SAFE_MODE do not match.",
      safeMode,
    } satisfies PlannerAssistantActionError;
  }

  const parsed = plannerAssistantRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_request",
      message: "Invalid planner assistant request.",
      safeMode,
      issues: formatValidationIssues(parsed.error.issues),
    } satisfies PlannerAssistantActionError;
  }

  try {
    const { prompt, focusDate, suggestionLimit } = parsed.data;
    const now = focusDate ? fromISODate(focusDate) ?? undefined : undefined;
    const plan = planWithAssistant({
      prompt,
      now,
      suggestionLimit,
    });

    return {
      ok: true,
      plan,
      safeMode,
    } satisfies PlannerAssistantActionSuccess;
  } catch (error) {
    if (error instanceof PlannerAssistantError) {
      if (error.code === "empty_prompt") {
        return {
          ok: false,
          error: error.code,
          message: "Describe your plan before asking the assistant.",
          safeMode,
        } satisfies PlannerAssistantActionError;
      }

      if (error.code === "budget_exhausted") {
        return {
          ok: false,
          error: error.code,
          message: "Planner assistant prompt exceeded the token budget.",
          safeMode,
        } satisfies PlannerAssistantActionError;
      }

      return {
        ok: false,
        error: error.code,
        message: "Planner assistant produced an invalid response.",
        safeMode,
      } satisfies PlannerAssistantActionError;
    }

    return {
      ok: false,
      error: "internal_error",
      message: error instanceof Error ? error.message : "Planner assistant failed.",
      safeMode,
    } satisfies PlannerAssistantActionError;
  }
}
