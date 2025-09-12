// src/app/page.tsx
// Server wrapper for the client HomePage

import * as React from "react";
import type { Metadata } from "next";
import { HomePage } from "@/components/home";

export const metadata: Metadata = {
  title: "Planner",
  description: "Plan your day, track goals, and review games.",
};

export default function Page() {
  return <HomePage />;
}

