import type { ComponentType, ReactElement } from "react";

type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

type StoryComponent<T> = T extends { component: infer C }
  ? C
  : T;

type StoryArgs<T> = StoryComponent<T> extends ComponentType<infer Props>
  ? Props
  : Record<string, unknown>;

type StoryContext<TArgs> = {
  args: TArgs;
};

type StoryDecorator<TArgs> = (
  Story: () => ReactElement | null,
  context: StoryContext<TArgs>,
) => ReactElement | null;

type BaseStory<TArgs> = {
  args?: Partial<TArgs>;
  render?: (args: TArgs) => ReactElement | null;
  decorators?: StoryDecorator<TArgs>[];
  parameters?: Record<string, unknown>;
  play?: (context: StoryContext<TArgs>) => unknown | Promise<unknown>;
  [key: string]: unknown;
};

export type StoryObj<T = unknown> = BaseStory<StoryArgs<T>>;

export type Meta<TComponent = unknown> = {
  title: string;
  component?: TComponent;
  decorators?: StoryDecorator<StoryArgs<TComponent>>[];
  parameters?: Record<string, unknown>;
  args?: Partial<StoryArgs<TComponent>>;
  argTypes?: Record<string, unknown>;
  tags?: string[];
} & Record<string, unknown>;
