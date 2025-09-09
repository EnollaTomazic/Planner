"use client";

import * as React from "react";
import Link from "next/link";

/**
 * HomePage — landing view with quick nav links.
 */
export default function HomePage() {
  return (
    <main className="page-shell py-6 space-y-6 text-center">
      <header>
        <h1 className="text-2xl font-semibold">Welcome to Planner</h1>
        <p className="mt-2 text-muted-foreground">
          Streamline your planning and reviews.
        </p>
      </header>
      <nav className="flex justify-center gap-4">
        <Link className="text-accent underline" href="/planner">
          Planner
        </Link>
        <Link className="text-accent underline" href="/reviews">
          Reviews
        </Link>
        <Link className="text-accent underline" href="/prompts">
          Prompts
        </Link>
      </nav>
    </main>
  );
}
