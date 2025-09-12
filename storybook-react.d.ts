declare module "@storybook/react" {
  import * as React from "react";

  export interface Meta<T> {
    title: string;
    component: T;
    decorators?: Array<(Story: React.ComponentType) => React.ReactNode>;
  }

  export type StoryObj<T> = {
    args?: T extends React.ComponentType<infer P> ? Partial<P> : never;
    render?: (
      args: T extends React.ComponentType<infer P> ? Partial<P> : never,
    ) => React.ReactNode;
  };
}
