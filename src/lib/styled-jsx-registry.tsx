"use client";

import type { ComponentType, PropsWithChildren, ReactElement } from "react";
import { useMemo } from "react";
import { useServerInsertedHTML } from "next/navigation";

interface StyledJsxStyleRegistry {
  styles(options?: { nonce?: string }): ReactElement[];
  flush(): void;
  add(props: unknown): void;
  remove(props: unknown): void;
}

interface StyledJsxModule {
  StyleRegistry: ComponentType<PropsWithChildren<{ registry?: StyledJsxStyleRegistry }>>;
  createStyleRegistry(): StyledJsxStyleRegistry;
}

function loadStyledJsx(): StyledJsxModule {
  try {
    return require("styled-jsx") as StyledJsxModule;
  } catch {
    return require("styled-jsx/dist/index/index.js") as StyledJsxModule;
  }
}

const { StyleRegistry, createStyleRegistry } = loadStyledJsx();

interface StyledJsxRegistryProps extends PropsWithChildren {
  readonly nonce?: string;
}

export default function StyledJsxRegistry({
  children,
  nonce,
}: StyledJsxRegistryProps): JSX.Element {
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
