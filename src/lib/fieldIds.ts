// src/lib/fieldIds.ts
import useFieldNaming, {
  type FieldNamingOptions,
  type FieldNamingResult,
} from "./useFieldNaming";

type ResolveFieldIdsOptions = Pick<
  FieldNamingOptions,
  "id" | "name" | "ariaLabel" | "ariaLabelStrategy" | "slugifyFallback"
>;

export function useResolveFieldIds(
  options: ResolveFieldIdsOptions = {},
): FieldNamingResult {
  return useFieldNaming(options);
}

export const resolveFieldIds = useResolveFieldIds;

export type { ResolveFieldIdsOptions };
