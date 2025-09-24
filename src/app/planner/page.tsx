// src/app/planner/page.tsx
// Server wrapper for the client PlannerPage

import type { Metadata } from "next";
import { PlannerPage } from "@/components/planner";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Planner",
  description: "Organize your tasks and goals using the Planner.",
};

export default function Page() {
  return <PlannerPage />;
}
