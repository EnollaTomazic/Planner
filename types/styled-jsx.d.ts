declare module "styled-jsx/dist/index/index" {
  import type { ReactElement, ReactNode } from "react";

  export type StyledJsxStyleRegistry = {
    styles(options?: { nonce?: string }): ReactElement[];
    flush(): void;
    add(props: unknown): void;
    remove(props: unknown): void;
  };

  export const StyleRegistry: ({
    children,
    registry,
  }: {
    children: ReactNode;
    registry?: StyledJsxStyleRegistry;
  }) => ReactElement;

  export function createStyleRegistry(): StyledJsxStyleRegistry;
}
