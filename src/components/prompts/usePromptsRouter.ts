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
  const paramsString = searchParams.toString();
  const params = React.useMemo(
    () => new URLSearchParams(paramsString),
    [paramsString],
  );
  const replaceParam = React.useCallback(
    (key: "view" | "section", value: string) => {
      const current = params.get(key);
      if (current === value) return;

      params.set(key, value);
      startTransition(() =>
        router.replace(`?${params.toString()}`, { scroll: false }),
      );
    },
    [params, router, startTransition],
  );

  const [view, setView] = React.useState<View>(
    () => (viewParam as View) || "components",
  );
  const [section, setSection] = React.useState<Section>(() =>
    getValidSection(sectionParam),
  );

  React.useEffect(() => {
    const v = (viewParam as View) || "components";
    setView((prev) => (v === prev ? prev : v));
  }, [viewParam]);

  React.useEffect(() => {
    const s = getValidSection(sectionParam);
    setSection((prev) => (s === prev ? prev : s));
  }, [sectionParam]);

  React.useEffect(() => {
    replaceParam("view", view);
  }, [view, replaceParam]);

  React.useEffect(() => {
    if (view !== "components") return;
    replaceParam("section", section);
  }, [section, view, replaceParam]);

  return { view, setView, section, setSection };
}
