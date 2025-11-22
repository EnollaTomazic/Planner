"use client";

import * as React from "react";

import { Textarea, type TextareaProps } from "./Textarea";

export type InsetTextareaProps = Omit<TextareaProps, "variant">;

export const InsetTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InsetTextareaProps
>(function InsetTextarea(props, ref) {
  return <Textarea ref={ref} variant="sunken" {...props} />;
});

InsetTextarea.displayName = "InsetTextarea";

