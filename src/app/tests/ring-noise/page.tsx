import type { Metadata } from "next";

import PreviewThemeClient from "@/components/gallery/PreviewThemeClient";
import type { Variant } from "@/lib/theme";
import RingNoisePreview from "./RingNoisePreview";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Ring gradient noise preview",
  description: "Visual regression harness for ring icon gradients.",
};

interface PageProps {
  readonly searchParams: Promise<{ variant?: string }>;
}

const DEFAULT_VARIANT: Variant = "lg";

function resolveVariant(value: string | undefined): Variant {
  if (value === "aurora") {
    return "aurora";
  }
  return DEFAULT_VARIANT;
}

export default async function RingNoisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const variant = resolveVariant(params?.variant);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PreviewThemeClient variant={variant} background={0} />
      <RingNoisePreview />
    </main>
  );
}
