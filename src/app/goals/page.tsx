import { type Metadata } from "next";
import { GoalsPage } from "@/components/pages";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Goals",
  description: "Track and manage your goals.",
};

export default function Page() {
  return <GoalsPage />;
}

