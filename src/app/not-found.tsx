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
      className="grid min-h-screen grid-cols-12 gap-4 place-content-center p-6 text-center"
      aria-labelledby={headerId}
    >
      <div className="col-span-12 space-y-2">
        <Header
          id={headerId}
          heading="Page not found"
          icon={<AlertCircle className="opacity-80" />}
        />
        <Hero
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
    </main>
  );
}
