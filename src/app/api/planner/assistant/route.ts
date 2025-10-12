import { NextResponse, type NextRequest } from "next/server";
import {
  planWithAssistantAction,
  resolvePlannerAssistantSafeMode,
  type PlannerAssistantActionError,
  type PlannerAssistantActionInput,
  type PlannerAssistantActionResult,
  type PlannerAssistantSafeModeState,
} from "@/app/planner/actions";

export const runtime = "nodejs";

function errorResponse(
  status: number,
  payload: Omit<PlannerAssistantActionError, "ok" | "safeMode"> & {
    safeMode?: PlannerAssistantSafeModeState;
  },
): NextResponse {
  const safeMode = payload.safeMode ?? resolvePlannerAssistantSafeMode();
  const body: PlannerAssistantActionError = {
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

function successResponse(result: Extract<PlannerAssistantActionResult, { ok: true }>): NextResponse {
  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
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

  const result = await planWithAssistantAction(payload as PlannerAssistantActionInput);

  if (result.ok) {
    return successResponse(result);
  }

  switch (result.error) {
    case "invalid_request":
      return errorResponse(400, {
        error: result.error,
        message: result.message,
        issues: result.issues,
        safeMode: result.safeMode,
      });
    case "safe_mode_mismatch":
      return errorResponse(409, {
        error: result.error,
        message: result.message,
        safeMode: result.safeMode,
      });
    case "empty_prompt":
      return errorResponse(422, {
        error: result.error,
        message: result.message,
        safeMode: result.safeMode,
      });
    case "budget_exhausted":
      return errorResponse(413, {
        error: result.error,
        message: result.message,
        safeMode: result.safeMode,
      });
    default:
      return errorResponse(500, {
        error: result.error,
        message: result.message,
        safeMode: result.safeMode,
      });
  }
}
