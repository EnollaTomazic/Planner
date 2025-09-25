// src/lib/useFieldIds.ts
import { type AriaAttributes } from "react";

import useFieldNaming, {
  type FieldNamingOptions,
} from "./useFieldNaming";

export type UseFieldIdsOptions = Pick<
  FieldNamingOptions,
  "ariaLabelStrategy" | "slugifyFallback"
> & {
  ariaInvalid?: AriaAttributes["aria-invalid"];
};

export type UseFieldIdsResult = {
  id: string;
  name: string;
  isInvalid: boolean;
};

export function useFieldIds(
  ariaLabel?: string,
  idProp?: string,
  nameProp?: string,
): UseFieldIdsResult;
export function useFieldIds(
  ariaLabel?: string,
  idProp?: string,
  nameProp?: string,
  options?: UseFieldIdsOptions,
): UseFieldIdsResult;
export function useFieldIds(
  ariaLabel?: string,
  idProp?: string,
  nameProp?: string,
  options: UseFieldIdsOptions = {},
): UseFieldIdsResult {
  const { ariaInvalid, ariaLabelStrategy, slugifyFallback } = options;

  const namingOptions: FieldNamingOptions = {
    id: idProp,
    name: nameProp,
    ariaLabel,
    ariaLabelStrategy,
    slugifyFallback,
  };

  const { id, name } = useFieldNaming(namingOptions);

  const normalizedInvalid =
    typeof ariaInvalid === "string" ? ariaInvalid.trim().toLowerCase() : null;
  const isInvalid =
    ariaInvalid === true ||
    (normalizedInvalid !== null &&
      normalizedInvalid.length > 0 &&
      normalizedInvalid !== "false");

  return { id, name, isInvalid };
}

export default useFieldIds;
