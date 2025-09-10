"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import ThemePicker from "@/components/ui/theme/ThemePicker";
import BackgroundPicker from "@/components/ui/theme/BackgroundPicker";
import { useRouter } from "next/navigation";
import type { ThemeState } from "@/lib/theme";

interface QuickActionsProps {
  theme: ThemeState;
  setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;
}

export default function QuickActions({ theme, setTheme }: QuickActionsProps) {
  const router = useRouter();

  return (
    <section aria-label="Quick actions" className="grid gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          className="rounded-full shadow-neo-inset focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
          onClick={() => router.push("/planner")}
        >
          Planner Today
        </Button>
        <Button
          className="rounded-full shadow-neo-inset focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
          tone="accent"
          onClick={() => router.push("/goals")}
        >
          New Goal
        </Button>
        <Button
          className="rounded-full shadow-neo-inset focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
          tone="accent"
          onClick={() => router.push("/reviews")}
        >
          New Review
        </Button>
        <div className="flex items-center gap-4">
          <ThemePicker
            variant={theme.variant}
            onVariantChange={v => setTheme(prev => ({ ...prev, variant: v }))}
            className="shrink-0"
          />
          <BackgroundPicker
            bg={theme.bg}
            onBgChange={b => setTheme(prev => ({ ...prev, bg: b }))}
            className="shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
