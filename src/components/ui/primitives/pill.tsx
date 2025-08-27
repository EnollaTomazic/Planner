"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Pill — uses the .pill class defined in globals.css */
export default function Pill({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <span className={cn("pill", className)}>{children}</span>;
}
