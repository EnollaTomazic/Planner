"use client";

import * as React from "react";

import { Input, type InputProps } from "./Input";

export type InsetInputProps = Omit<InputProps, "variant">;

export const InsetInput = React.forwardRef<HTMLInputElement, InsetInputProps>(
  function InsetInput(props, ref) {
    return <Input ref={ref} variant="sunken" {...props} />;
  },
);

InsetInput.displayName = "InsetInput";

