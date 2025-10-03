declare module "jest-axe" {
  export interface AxeMatchers<R = unknown> {
    toHaveNoViolations(): R;
  }

  export type AxeRunOptions = Record<string, unknown>;

  export type AxeResults = {
    violations: unknown[];
  } & Record<string, unknown>;

  export type AxeA11yCheck = (
    context?: Element | DocumentFragment | string,
    options?: AxeRunOptions,
  ) => Promise<AxeResults>;

  export function axe(
    context?: Element | DocumentFragment | string,
    options?: AxeRunOptions,
  ): Promise<AxeResults>;

  export function configureAxe(options?: AxeRunOptions): AxeA11yCheck;

  export const toHaveNoViolations: {
    toHaveNoViolations(this: unknown, results: AxeResults): {
      message(): string;
      pass: boolean;
    };
  };
}
