import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button, Header, Hero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  const headerId = "not-found-header";

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
      aria-labelledby={headerId}
    >
      <div className="hero2-frame relative overflow-hidden rounded-card r-card-lg p-4">
        <span aria-hidden className="hero2-beams" />
        <span aria-hidden className="hero2-scanlines" />
        <span aria-hidden className="hero2-noise" />

        <div className="relative z-[2] space-y-[var(--spacing-2)]">
          <Header
            id={headerId}
            heading="Page not found"
            icon={<AlertCircle className="opacity-80" />}
          />
          <Hero
            frame={false}
            heading="This page does not exist"
            actions={
              <Link href="/">
                <Button className="px-[var(--spacing-4)]">Go home</Button>
              </Link>
            }
          >
            <p className="text-sm text-muted-foreground">
              The page you are looking for does not exist.
            </p>
          </Hero>
        </div>

        <div
          aria-hidden
          className="absolute inset-0 rounded-card r-card-lg ring-1 ring-inset ring-border/55"
        />
      </div>
    </main>
  );
}
