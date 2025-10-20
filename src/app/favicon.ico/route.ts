import {
  createPlannerIconResponse,
  PLANNER_ICON_CONTENT_TYPE,
} from "@/lib/planner-icon"

export const dynamic = "force-static"
export const runtime = "edge"

export function GET() {
  const response = createPlannerIconResponse()
  response.headers.set("content-type", PLANNER_ICON_CONTENT_TYPE)
  return response
}
