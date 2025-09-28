"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionCard } from "@/components/ui";
import { useBasePath } from "@/lib/base-path";

export default function PagesCheckClient() {
  const { basePath, resolveHref, resolveAsset } = useBasePath();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  const plannerHref = resolveHref("/planner");
  const componentsHref = resolveHref("/components");
  const logoSrc = resolveAsset("/planner-logo.svg");
  const statusLabelId = "pages-check-heading";
  const readiness = ready ? "ready" : "loading";

  return (
    <PageShell
      as="main"
      grid
      aria-labelledby={statusLabelId}
      className="min-h-screen py-[var(--space-6)] md:py-[var(--space-8)]"
      data-pages-check={readiness}
      data-testid="pages-check-container"
    >
      <SectionCard className="col-span-full">
        <SectionCard.Header
          id={statusLabelId}
          title={
            <>
              Pages export smoke check
              <span className="mt-[var(--spacing-0-5)] block text-label text-muted-foreground">
                {basePath
                  ? `Serving from \"${basePath}\"`
                  : "Serving from the root path"}
              </span>
            </>
          }
          titleClassName="text-title font-semibold tracking-tight"
          titleAs="h1"
          sticky={false}
        />
        <SectionCard.Body className="space-y-[var(--space-4)]">
          <p className="text-ui text-muted-foreground">
            This route confirms that a static export works when the site lives
            under a prefixed directory.
          </p>
          <dl className="grid gap-[var(--space-3)] sm:grid-cols-2">
            <div className="space-y-[var(--space-1)]">
              <dt className="text-label font-medium text-muted-foreground">
                Base path
              </dt>
              <dd
                className="text-ui font-semibold"
                data-testid="pages-check-base-path"
              >
                {basePath || "/"}
              </dd>
            </div>
            <div className="space-y-[var(--space-1)]">
              <dt className="text-label font-medium text-muted-foreground">
                Sample links
              </dt>
              <dd className="flex flex-wrap gap-[var(--space-2)] text-ui">
                <Link
                  href={plannerHref}
                  className="underline decoration-dotted underline-offset-4 hover:text-foreground focus-visible:text-foreground"
                >
                  Planner
                </Link>
                <Link
                  href={componentsHref}
                  className="underline decoration-dotted underline-offset-4 hover:text-foreground focus-visible:text-foreground"
                >
                  Components
                </Link>
              </dd>
            </div>
          </dl>
          <figure className="flex flex-wrap items-center gap-[var(--space-3)]">
            <Image
              src={logoSrc}
              alt="Planner wordmark"
              width={120}
              height={40}
              className="h-auto rounded-card border border-border bg-surface/80 p-[var(--space-1)] shadow-neo"
              data-testid="pages-check-logo"
            />
            <figcaption className="text-label text-muted-foreground">
              Static assets resolve through the detected base path.
            </figcaption>
          </figure>
        </SectionCard.Body>
      </SectionCard>
    </PageShell>
  );
}
