import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SPEC_DATA, type Section } from "./constants";

const PROMPTS_VIEW_KEYS = ["components", "onboarding"] as const;

export type PromptsView = (typeof PROMPTS_VIEW_KEYS)[number];

function hasSection(value: string): value is Section {
  return Object.prototype.hasOwnProperty.call(SPEC_DATA, value);
}

function getValidSection(value: string | null): Section {
  return value && hasSection(value) ? value : "buttons";
}

function isPromptsView(value: string | null): value is PromptsView {
  return PROMPTS_VIEW_KEYS.includes((value ?? "") as PromptsView);
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

  const view = isPromptsView(viewParam) ? viewParam : "components";
  const section = React.useMemo(
    () => getValidSection(sectionParam),
    [sectionParam],
  );
  const setView = React.useCallback(
    (v: PromptsView) => replaceParam("view", v),
    [replaceParam],
  );
  const setSection = React.useCallback(
    (s: Section) => replaceParam("section", s),
    [replaceParam],
  );

  return { view, setView, section, setSection };
}
