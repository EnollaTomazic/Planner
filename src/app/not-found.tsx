import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Button,
  Header,
  PageShell,
} from "@/components/ui";
import { withBasePath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  const headerId = "not-found-header";

  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-5)] text-center"
      aria-labelledby={headerId}
      role="region"
    >
      <Header
        id={headerId}
        heading="Page not found"
        icon={<AlertCircle className="opacity-80" />}
        sticky={false}
        actions={
          <Button asChild>
            <Link href={withBasePath("/", { skipForNextLink: true })}>Go home</Link>
          </Button>
        }
      >
        <p className="text-ui text-muted-foreground">
          The page you are looking for does not exist.
        </p>
      </Header>
    </PageShell>
  );
}
