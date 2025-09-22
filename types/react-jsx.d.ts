import type * as ReactJSXRuntime from "react/jsx-runtime";

declare global {
  namespace JSX {
    type Element = ReactJSXRuntime.JSX.Element;
    interface ElementClass
      extends ReactJSXRuntime.JSX.ElementClass {}
    interface ElementAttributesProperty
      extends ReactJSXRuntime.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute
      extends ReactJSXRuntime.JSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> =
      ReactJSXRuntime.JSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicAttributes
      extends ReactJSXRuntime.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T>
      extends ReactJSXRuntime.JSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements
      extends ReactJSXRuntime.JSX.IntrinsicElements {}
  }
}

export {};
