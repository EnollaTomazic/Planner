import React from "react";

import "../app/globals.css";
import "../app/themes.css";

import DepthThemeProvider from "@/lib/depth-theme-context";
import ThemeProvider from "@/lib/theme-context";
import { depthThemeEnabled } from "@/lib/features";

const depthThemeState = depthThemeEnabled;
const depthThemeAttribute = depthThemeState ? "enabled" : "legacy";

type StoryDecorator = (
  Story: () => React.ReactElement | null,
  context?: { args: Record<string, unknown> },
) => React.ReactElement | null;

export const decorators: StoryDecorator[] = [
  (Story) => (
    <ThemeProvider>
      <DepthThemeProvider enabled={depthThemeState}>
        <div
          className="glitch-root theme-lg min-h-screen bg-background text-foreground"
          data-depth-theme={depthThemeAttribute}
        >
          <Story />
        </div>
      </DepthThemeProvider>
    </ThemeProvider>
  ),
];

export const parameters: Record<string, unknown> = {
  backgrounds: { disable: true },
  layout: "fullscreen",
};
