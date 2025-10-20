// Programmatic favicon so the server returns a valid icon.
import { createPlannerIconResponse, PLANNER_ICON_CONTENT_TYPE, PLANNER_ICON_SIZE } from "@/lib/planner-icon"

export const size = PLANNER_ICON_SIZE
export const contentType = PLANNER_ICON_CONTENT_TYPE
export const dynamic = "force-static"

export default function Icon() {
  return createPlannerIconResponse()
}
