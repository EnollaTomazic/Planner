import type { Metadata } from "next";
import { TeamCompPage } from "@/components/team/TeamCompPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the team behind Planner.",
};

export default function Page() {
  return <TeamCompPage />;
}
