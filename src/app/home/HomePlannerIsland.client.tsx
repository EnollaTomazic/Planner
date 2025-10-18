"use client"

import dynamic from "next/dynamic"
import type { HomePlannerIslandPlannerProps } from "./HomePlannerIsland.planner"

const HomePlannerIslandPlanner = dynamic<HomePlannerIslandPlannerProps>(
  () => import("./HomePlannerIsland.planner"),
  { ssr: false },
)

export type HomePlannerIslandClientProps = HomePlannerIslandPlannerProps

export default function HomePlannerIslandClient(
  props: HomePlannerIslandClientProps,
) {
  return <HomePlannerIslandPlanner {...props} />
}
