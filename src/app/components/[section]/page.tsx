import { notFound, redirect } from "next/navigation";

import {
  DEFAULT_COMPONENTS_VIEW,
  getAllComponentSlugs,
  resolveComponentsSlug,
} from "@/components/gallery-page/slug";
import { withBasePath } from "@/lib/utils";

export { metadata } from "../page";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllComponentSlugs().map((section) => ({ section }));
}

interface ComponentsSectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function ComponentsSectionPage({
  params,
}: ComponentsSectionPageProps) {
  const { section } = await params;
  const resolved = resolveComponentsSlug(section);
  if (!resolved) {
    notFound();
  }

  const searchParams = new URLSearchParams();

  if (resolved.section) {
    searchParams.set("section", resolved.section);
  }

  if (
    resolved.view &&
    (resolved.viewExplicit || resolved.view !== DEFAULT_COMPONENTS_VIEW)
  ) {
    searchParams.set("view", resolved.view);
  }

  if (resolved.query) {
    searchParams.set("q", resolved.query);
  }

  const query = searchParams.toString();
  const target = withBasePath(query ? `/components?${query}` : "/components");

  redirect(target);
}
