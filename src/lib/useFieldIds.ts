import * as React from "react";
import { slugify } from "./utils";

type AriaInvalidValue =
  | boolean
  | "true"
  | "false"
  | "grammar"
  | "spelling"
  | undefined;

export function useFieldIds(
  ariaLabel?: string,
  idProp?: string,
  nameProp?: string,
): {
  id: string;
  name: string;
  isInvalid: (value: AriaInvalidValue) => boolean;
} {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const labelSlug = React.useMemo(() => slugify(ariaLabel), [ariaLabel]);

  const name = React.useMemo(() => {
    if (nameProp) return nameProp;
    if (labelSlug) return labelSlug;
    if (idProp) {
      const slugged = slugify(idProp);
      return slugged || id;
    }
    const slugged = slugify(id);
    return slugged || id;
  }, [nameProp, labelSlug, idProp, id]);

  const isInvalid = React.useCallback(
    (value: AriaInvalidValue) => value === true || value === "true",
    [],
  );

  return React.useMemo(
    () => ({ id, name, isInvalid }),
    [id, name, isInvalid],
  );
}
