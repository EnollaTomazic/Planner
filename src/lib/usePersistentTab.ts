import type { Dispatch, SetStateAction } from "react";

import { usePersistentState } from "@/lib/db";

export function usePersistentTab<T extends string>(
  storageKey: string,
  defaultValue: T,
  decode: (value: unknown) => T | null,
): readonly [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = usePersistentState<T>(storageKey, defaultValue, { decode });
  return [value, setValue] as const;
}
