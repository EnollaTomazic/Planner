"use client";

import NavBar from "@/components/chrome/NavBar";
import ThemeToggle from "@/components/ui/theme/ThemeToggle";
import AnimationToggle from "@/components/ui/AnimationToggle";
import "@/app/globals.css";

/**
 * SiteChrome — sticky top bar with Lavender-Glitch hairline
 * - Uses .sticky-blur (backdrop + border) from globals.css
 * - Full-width container; content constrained by .page-shell
 * - Z-index > heroes, so it stays above scrolling headers
 */
export default function SiteChrome() {
  return (
    <header role="banner" className="sticky-blur top-0 z-50">
      {/* Bar content */}
      <div className="page-shell h-14 flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full animate-pulse"
            style={{ background: "hsl(var(--accent))" }}
            aria-hidden
          />
          <span className="font-mono tracking-wide text-[hsl(var(--muted-foreground))]">
            NOXIS PLANNER
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NavBar />
          <ThemeToggle />
          <AnimationToggle />
        </div>
      </div>

      {/* Hairline (neon-friendly, non-interactive) */}
      <div
        aria-hidden
        className="pointer-events-none h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
        }}
      />
    </header>
  );
}
