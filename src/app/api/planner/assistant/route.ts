import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { fromISODate } from "@/lib/date";
import {
  PlannerAssistantError,
  plannerAssistantPlanValidator,
  planWithAssistant,
} from "@/lib/assistant/plannerAgent";

export const runtime = "nodejs";

const ENABLED_FLAG_VALUES = new Set(["1", "true", "on", "yes"]);
const DISABLED_FLAG_VALUES = new Set(["0", "false", "off", "no"]);

const requestSchema = z.object({
  prompt: z.string(),
  focusDate: z.string().optional(),
  suggestionLimit: z.number().int().positive().max(10).optional(),
});

type SafeModeState = {
  readonly server: boolean;
  readonly client: boolean;
  readonly active: boolean;
};

type PlannerAssistantSuccessResponse = {
  ok: true;
  plan: z.infer<typeof plannerAssistantPlanValidator>;
  safeMode: SafeModeState;
};

type PlannerAssistantErrorResponse = {
  ok: false;
  error: string;
  message: string;
  safeMode: SafeModeState;
  issues?: unknown;
};

function normalizeFlag(value: string | undefined): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (ENABLED_FLAG_VALUES.has(normalized)) {
    return true;
  }

  if (DISABLED_FLAG_VALUES.has(normalized)) {
    return false;
  }

  return false;
}

function resolveSafeMode(): SafeModeState {
  const server = normalizeFlag(process.env.SAFE_MODE);
  const client = normalizeFlag(process.env.NEXT_PUBLIC_SAFE_MODE);
  return {
    server,
    client,
    active: server && client,
  } satisfies SafeModeState;
}

function errorResponse(
  status: number,
  payload: Omit<PlannerAssistantErrorResponse, "ok" | "safeMode"> & {
    safeMode?: SafeModeState;
  },
): NextResponse {
  const safeMode = payload.safeMode ?? resolveSafeMode();
  const body: PlannerAssistantErrorResponse = {
    ok: false,
    safeMode,
    ...payload,
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function successResponse(
  plan: z.infer<typeof plannerAssistantPlanValidator>,
  safeMode: SafeModeState,
): NextResponse {
  const body: PlannerAssistantSuccessResponse = {
    ok: true,
    plan,
    safeMode,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function parseRequestBody(body: unknown) {
  const result = requestSchema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    }));
    throw Object.assign(new Error("Invalid planner assistant request."), {
      code: "invalid_request",
      issues,
    });
  }
  return result.data;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return errorResponse(400, {
      error: "invalid_request",
      message: "Request body must be valid JSON.",
      issues: error instanceof Error ? error.message : error,
    });
  }

  const safeMode = resolveSafeMode();

  if (safeMode.server !== safeMode.client) {
    return errorResponse(409, {
      error: "safe_mode_mismatch",
      message:
        "Planner assistant is disabled because SAFE_MODE and NEXT_PUBLIC_SAFE_MODE do not match.",
      safeMode,
    });
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = parseRequestBody(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid planner assistant request.";
    const issues = (error as { issues?: unknown }).issues;
    return errorResponse(400, {
      error: "invalid_request",
      message,
      issues,
      safeMode,
    });
  }

  try {
    const now = parsed.focusDate ? fromISODate(parsed.focusDate) ?? undefined : undefined;
    const plan = planWithAssistant({
      prompt: parsed.prompt,
      now,
      suggestionLimit: parsed.suggestionLimit,
    });
    return successResponse(plan, safeMode);
  } catch (error) {
    if (error instanceof PlannerAssistantError) {
      if (error.code === "empty_prompt") {
        return errorResponse(422, {
          error: error.code,
          message: "Describe your plan before asking the assistant.",
          safeMode,
        });
      }

      if (error.code === "budget_exhausted") {
        return errorResponse(413, {
          error: error.code,
          message: "Planner assistant prompt exceeded the token budget.",
          safeMode,
        });
      }

      return errorResponse(500, {
        error: error.code,
        message: "Planner assistant produced an invalid response.",
        safeMode,
      });
    }

    return errorResponse(500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : "Planner assistant failed.",
      safeMode,
    });
  }
}
