declare module "jest-axe" {
  export interface AxeResults {
    violations: unknown[];
    [key: string]: unknown;
  }

  export interface AxeMatchers<R = unknown> {
    toHaveNoViolations(): R;
  }

  export type Axe = (html: unknown, options?: unknown) => Promise<AxeResults>;

  export function configureAxe(options?: unknown): Axe;

  export const axe: Axe;

  export const toHaveNoViolations: {
    toHaveNoViolations(
      results: AxeResults,
    ): { pass: boolean; message(): string };
  };
}
