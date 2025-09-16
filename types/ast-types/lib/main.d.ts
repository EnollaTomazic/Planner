export type ASTNode = unknown;
export type Type<T = unknown> = {
  check(value: unknown): value is T;
  assert(value: unknown): asserts value is T;
};
export type AnyType = Type<unknown>;
export type Field = unknown;

export const astNodesAreEquivalent: {
  (a: unknown, b: unknown, problemPath?: unknown): boolean;
  assert(a: unknown, b: unknown): void;
};

export const builders: Record<string, (...args: unknown[]) => unknown>;
export const builtInTypes: Record<string, Type<unknown>>;
export function defineMethod(
  name: string,
  func?: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown;
export function eachField(
  object: unknown,
  callback: (name: string, value: unknown) => unknown,
  context?: unknown,
): void;
export function finalize(): void;
export function getBuilderName(typeName: string): unknown;
export function getFieldNames(object: unknown): string[];
export function getFieldValue(object: unknown, fieldName: unknown): unknown;
export function getSupertypeNames(typeName: string): string[];
export const namedTypes: Record<string, Type<unknown>>;
export type NodePath = unknown;
export type Path = unknown;
export type PathVisitor = unknown;
export function someField(
  object: unknown,
  callback: (name: string, value: unknown) => unknown,
  context?: unknown,
): boolean;
export function use<T>(plugin: T): T;
export function visit<M = unknown>(node: ASTNode, methods?: unknown): unknown;
export type Visitor = unknown;
