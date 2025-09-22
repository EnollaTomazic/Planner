import type * as React from "react";

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    interface ElementClass extends React.JSX.ElementClass {}
    interface ElementAttributesProperty
      extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute
      extends React.JSX.ElementChildrenAttribute {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  }
}

export {};
