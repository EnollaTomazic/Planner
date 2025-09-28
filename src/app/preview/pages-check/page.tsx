import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/primitives/Button";
import PageShell from "@/components/ui/layout/PageShell";
import SectionCard from "@/components/ui/layout/SectionCard";
import HeroPortraitFrame from "@/components/home/HeroPortraitFrame";
import { getBasePath, withBasePath } from "@/lib/utils";

const basePath = getBasePath();
const basePathLabel = basePath || "/";
const headingId = "pages-check-heading";

export const metadata: Metadata = {
  title: "GitHub Pages routing check",
  description: "Verifies static assets resolve correctly when the site is served from a base path.",
};

export default function PagesCheckPage() {
  const heroImageSrc = withBasePath("/hero_image.png");

  return (
    <PageShell
      as="section"
      grid
      aria-labelledby={headingId}
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
    >
      <SectionCard
        aria-labelledby={headingId}
        className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3"
      >
        <div className="section-h">
          <h1
            id={headingId}
            className="text-title font-semibold tracking-[-0.01em]"
          >
            GitHub Pages routing check
          </h1>
        </div>
        <div className="section-b flex flex-col items-center gap-[var(--space-4)] text-center">
          <p className="text-ui text-muted-foreground" data-testid="base-path-value">
            Base path resolved to <span className="font-mono text-foreground">{basePathLabel}</span>
          </p>
          <HeroPortraitFrame
            frame={false}
            imageSrc={heroImageSrc}
            imageAlt="Illustration used to confirm static asset routing."
            className="shadow-outline-subtle"
          />
          <Button asChild variant="secondary">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
