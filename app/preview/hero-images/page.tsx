import type { Metadata } from "next";

import {
  DEFAULT_HERO_STATE,
  DEFAULT_HERO_VARIANT,
  HERO_ILLUSTRATION_STATES,
  type HeroIllustrationState,
} from "@/data/heroImages";
import {
  PageShell,
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
} from "@/components/ui";
import { VARIANTS, type Variant } from "@/lib/theme";

import HeroImagesPreviewClient from "./HeroImagesPreviewClient";

const VARIANT_IDS = new Set<Variant>(VARIANTS.map(({ id }) => id));
const HERO_STATE_IDS = new Set<HeroIllustrationState>(HERO_ILLUSTRATION_STATES);

function coerceVariant(value: string | undefined): Variant {
  if (value && VARIANT_IDS.has(value as Variant)) {
    return value as Variant;
  }
  return DEFAULT_HERO_VARIANT;
}

function coerceState(value: string | undefined): HeroIllustrationState {
  if (value && HERO_STATE_IDS.has(value as HeroIllustrationState)) {
    return value as HeroIllustrationState;
  }
  return DEFAULT_HERO_STATE;
}

function coerceAutoplay(value: string | undefined): boolean {
  if (!value) {
    return true;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "0" || normalized === "false" || normalized === "off") {
    return false;
  }
  if (normalized === "1" || normalized === "true" || normalized === "on") {
    return true;
  }
  return true;
}

function extractParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

type HeroImagesPreviewSearchParams = Record<string, string | string[] | undefined>;

type HeroImagesPreviewPageProps = {
  readonly searchParams?: Promise<HeroImagesPreviewSearchParams>;
};

export const metadata: Metadata = {
  title: "Hero illustrations preview",
  description:
    "Cycle every Planner theme through hero illustration states to validate parity, accessibility, and motion settings.",
};

export const dynamic = "force-static";

export default async function HeroImagesPreviewPage({
  searchParams,
}: HeroImagesPreviewPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const variant = coerceVariant(extractParam(resolvedSearchParams?.variant));
  const state = coerceState(extractParam(resolvedSearchParams?.state));
  const autoplay = coerceAutoplay(extractParam(resolvedSearchParams?.autoplay));

  return (
    <PageShell
      as="main"
      grid
      aria-labelledby="hero-images-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="hero-images-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Hero illustrations
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Verify the hero illustration library renders correctly across Planner themes and visual states. Use the
            controls below to pin a theme/state combination or disable the automatic cycle for motion-sensitive
            reviews.
          </p>
        </SectionCardHeader>
        <SectionCardBody>
          <HeroImagesPreviewClient
            initialVariant={variant}
            initialState={state}
            autoplay={autoplay}
          />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
