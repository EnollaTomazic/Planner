import type { Metadata } from "next";
import TeamCompPage from "@/components/team/TeamCompPage";

export const metadata: Metadata = { title: "Comps · 13 League Review" };

export default function Page() {
  return <TeamCompPage />;
}
