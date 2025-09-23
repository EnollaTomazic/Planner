"use client";

import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { useServerInsertedHTML } from "next/navigation";
import type { StyledJsxStyleRegistry } from "styled-jsx/dist/index/index";
import { StyleRegistry, createStyleRegistry } from "styled-jsx/dist/index/index";

interface StyledJsxRegistryProps extends PropsWithChildren {
  readonly nonce?: string;
}

export default function StyledJsxRegistry({
  children,
  nonce,
}: StyledJsxRegistryProps) {
  const registry: StyledJsxStyleRegistry = useMemo(
    () => createStyleRegistry(),
    [],
  );

  useServerInsertedHTML(() => {
    const styles = registry.styles({ nonce });
    registry.flush();

    return <>{styles}</>;
  });

  return <StyleRegistry registry={registry}>{children}</StyleRegistry>;
}
