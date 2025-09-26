import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Button,
  PageHeader,
  PageShell,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  const headerId = "not-found-header";

  return (
    <PageShell
      as="section"
      className="flex min-h-screen flex-col items-center justify-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-5)] text-center"
      aria-labelledby={headerId}
      role="region"
    >
      <PageHeader
        header={{
          id: headerId,
          heading: "Page not found",
          icon: <AlertCircle className="opacity-80" />,
        }}
        hero={{
          heading: "This page does not exist",
          actions: (
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
          ),
          children: (
            <p className="text-ui text-muted-foreground">
              The page you are looking for does not exist.
            </p>
          ),
        }}
      />
    </PageShell>
  );
}
