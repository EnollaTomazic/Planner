import type { Metadata } from "next";
import TeamCompPage from "@/components/team/TeamCompPage";

export const metadata: Metadata = { title: "Team Comp · 13 League Review" };

export default function Page() {
  return <TeamCompPage />;
}
