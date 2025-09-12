import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SPEC_DATA, type View, type Section } from "./constants";

function getValidSection(value: string | null): Section {
  return value && value in SPEC_DATA ? (value as Section) : "buttons";
}

export function usePromptsRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = React.useTransition();
  const viewParam = searchParams.get("view");
  const sectionParam = searchParams.get("section");

  const [view, setView] = React.useState<View>(
    () => (viewParam as View) || "components",
  );
  const [section, setSection] = React.useState<Section>(() =>
    getValidSection(sectionParam),
  );

  React.useEffect(() => {
    const v = (viewParam as View) || "components";
    if (v !== view) setView(v);
  }, [viewParam, view]);

  React.useEffect(() => {
    const s = getValidSection(sectionParam);
    if (s !== section) setSection(s);
  }, [sectionParam, section]);

  React.useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("view");
    if (current === view) return;
    sp.set("view", view);
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [view, router, searchParams, startTransition]);

  React.useEffect(() => {
    if (view !== "components") return;
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("section");
    if (current === section) return;
    sp.set("section", section);
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [section, view, router, searchParams, startTransition]);

  return { view, setView, section, setSection };
}
