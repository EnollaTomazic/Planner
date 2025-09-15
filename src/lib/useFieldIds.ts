import * as React from "react";

import { slugify } from "./utils";

export type UseFieldIdsResult = {
  id: string;
  name: string;
  isInvalid: boolean;
};

export default function useFieldIds(
  ariaLabel?: string,
  idProp?: string,
  nameProp?: string,
  ariaInvalid?: React.AriaAttributes["aria-invalid"],
): UseFieldIdsResult {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const fromLabel = slugify(ariaLabel);
  const fromId = slugify(id);

  let name = nameProp;

  if (!name) {
    if (fromLabel) {
      name = fromLabel;
    } else if (!ariaLabel) {
      name = fromId;
    }
  }

  if (!name) {
    name = id;
  }

  const isInvalid =
    ariaInvalid === true ||
    (typeof ariaInvalid === "string" && ariaInvalid.toLowerCase() === "true");

  return { id, name, isInvalid };
}
