import type {
  PlannerAssistantActionError,
  PlannerAssistantActionInput,
  PlannerAssistantActionResult,
  PlannerAssistantSafeModeState,
} from "./planner-assistant-service";

export type {
  PlannerAssistantActionError,
  PlannerAssistantActionInput,
  PlannerAssistantActionResult,
  PlannerAssistantSafeModeState,
} from "./planner-assistant-service";

const STATIC_SAFE_MODE: PlannerAssistantSafeModeState = {
  server: true,
  client: true,
  active: true,
};

const isStaticExport =
  process.env.GITHUB_PAGES === "true" || process.env.EXPORT_STATIC === "true";

async function loadServerActions() {
  return import("./planner-assistant-service");
}

export async function resolvePlannerAssistantSafeMode(): Promise<PlannerAssistantSafeModeState> {
  if (isStaticExport) {
    return STATIC_SAFE_MODE;
  }

  const { resolvePlannerAssistantSafeMode } = await loadServerActions();
  return resolvePlannerAssistantSafeMode();
}

export async function planWithAssistantAction(
  input: PlannerAssistantActionInput,
): Promise<PlannerAssistantActionResult> {
  if (isStaticExport) {
    const safeMode = await resolvePlannerAssistantSafeMode();
    return {
      ok: false,
      error: "static_export_unsupported",
      message: "Planner assistant is unavailable in static exports.",
      safeMode,
    } satisfies PlannerAssistantActionError;
  }

  const { planWithAssistantAction } = await loadServerActions();
  return planWithAssistantAction(input);
}
