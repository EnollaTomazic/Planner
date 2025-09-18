import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SPEC_DATA, type View, type Section } from "./constants";

function hasSection(value: string): value is Section {
  return Object.prototype.hasOwnProperty.call(SPEC_DATA, value);
}

function getValidSection(value: string | null): Section {
  return value && hasSection(value) ? value : "buttons";
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

  const view = (viewParam as View) || "components";
  const section = React.useMemo(
    () => getValidSection(sectionParam),
    [sectionParam],
  );
  const setView = React.useCallback(
    (v: View) => replaceParam("view", v),
    [replaceParam],
  );
  const setSection = React.useCallback(
    (s: Section) => replaceParam("section", s),
    [replaceParam],
  );

  return { view, setView, section, setSection };
}
