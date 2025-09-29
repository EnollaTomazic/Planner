import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TaskRow, type DayTask } from "@/components/planner";
import {
  BG_CLASSES,
  VARIANTS,
  applyTheme,
  type ThemeState,
  type Variant,
} from "@/lib/theme";

function getCurrentThemeState(): ThemeState {
  if (typeof document === "undefined") {
    return { variant: "lg", bg: 0 };
  }

  const { classList } = document.documentElement;
  const themeClass = Array.from(classList).find((className) =>
    className.startsWith("theme-"),
  );
  const variantEntry = VARIANTS.find(
    ({ id }) => themeClass === `theme-${id}`,
  );
  const backgroundIndex = BG_CLASSES.findIndex(
    (className) => className && classList.contains(className),
  );
  const bg =
    backgroundIndex > 0 && backgroundIndex < BG_CLASSES.length
      ? (backgroundIndex as ThemeState["bg"])
      : 0;

  return { variant: variantEntry?.id ?? "lg", bg };
}

function ThemeSandbox({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = getCurrentThemeState();
    applyTheme({ variant, bg: 0 });
    return () => {
      applyTheme(previous);
    };
  }, [variant]);

  return <>{children}</>;
}

function ReducedMotionPreview({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const alreadyApplied = root.classList.contains("no-animations");
    if (alreadyApplied) {
      return;
    }

    root.classList.add("no-animations");
    return () => {
      root.classList.remove("no-animations");
    };
  }, []);

  return <>{children}</>;
}

interface TaskRowStoryItemProps {
  id: string;
  title: string;
  initialDone?: boolean;
  initialImages?: string[];
}

function TaskRowStoryItem({
  id,
  title,
  initialDone = false,
  initialImages = [],
}: TaskRowStoryItemProps) {
  const [task, setTask] = React.useState<DayTask>(() => ({
    id,
    title,
    done: initialDone,
    createdAt: Date.now(),
    images: initialImages,
  }));

  const toggleTask = React.useCallback(() => {
    setTask((previous) => ({ ...previous, done: !previous.done }));
  }, []);

  const renameTask = React.useCallback((nextTitle: string) => {
    setTask((previous) => ({ ...previous, title: nextTitle }));
  }, []);

  const addImage = React.useCallback((url: string) => {
    setTask((previous) => ({
      ...previous,
      images: [...previous.images, url],
    }));
  }, []);

  const removeImage = React.useCallback((_url: string, index: number) => {
    setTask((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }, []);

  const deleteTask = React.useCallback(() => {
    setTask((previous) => ({
      ...previous,
      title: `${previous.title} (archived)`,
      done: false,
      images: [],
    }));
  }, []);

  return (
    <TaskRow
      task={task}
      toggleTask={toggleTask}
      deleteTask={deleteTask}
      renameTask={renameTask}
      selectTask={() => {}}
      addImage={addImage}
      removeImage={removeImage}
    />
  );
}

interface TaskRowStoryWrapperProps {
  variant: Variant;
  reducedMotion?: boolean;
}

function TaskRowStoryWrapper({
  variant,
  reducedMotion = false,
}: TaskRowStoryWrapperProps) {
  const content = (
    <div className="space-y-[var(--space-4)]">
      <div className="space-y-[var(--space-1)]">
        <h4 className="text-ui font-semibold text-foreground">
          Sprint backlog
        </h4>
        <p className="text-ui text-muted-foreground">
          Toggle a task to preview the bounce and slide motion. New rows enter
          from below the stack while completed tasks settle softly back into
          place.
        </p>
      </div>
      <ul className="space-y-[var(--space-2)]">
        <TaskRowStoryItem
          id="motion-task-1"
          title="Audit planner motion tokens"
        />
        <TaskRowStoryItem
          id="motion-task-2"
          title="Verify reduced-motion fallback"
          initialDone
          initialImages={["https://placekitten.com/160/160"]}
        />
      </ul>
    </div>
  );

  const body = reducedMotion ? (
    <ReducedMotionPreview>{content}</ReducedMotionPreview>
  ) : (
    content
  );

  return (
    <ThemeSandbox variant={variant}>
      <div className="max-w-2xl rounded-card r-card-lg border border-border/40 bg-card/70 p-[var(--space-4)] shadow-neo-soft">
        {body}
      </div>
    </ThemeSandbox>
  );
}

const meta = {
  title: "Planner/TaskRow",
  component: TaskRowStoryWrapper,
  args: {
    variant: "lg" as Variant,
    reducedMotion: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS.map(({ id }) => id),
    },
    reducedMotion: {
      control: "boolean",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "TaskRow animates creation and completion events with Framer Motion wrappers. The stories below exercise every theme and a reduced-motion preview so Chromatic captures bounce, slide, and fallback behaviors.",
      },
    },
  },
} satisfies Meta<typeof TaskRowStoryWrapper>;

export default meta;

type Story = StoryObj<typeof TaskRowStoryWrapper>;

export const Glitch: Story = {
  name: "Glitch",
  args: {
    variant: "lg",
  },
};

export const Aurora: Story = {
  args: {
    variant: "aurora",
  },
};

export const Kitten: Story = {
  args: {
    variant: "kitten",
  },
};

export const Oceanic: Story = {
  args: {
    variant: "ocean",
  },
};

export const Citrus: Story = {
  args: {
    variant: "citrus",
  },
};

export const Noir: Story = {
  args: {
    variant: "noir",
  },
};

export const Hardstuck: Story = {
  args: {
    variant: "hardstuck",
  },
};

export const ReducedMotion: Story = {
  args: {
    variant: "lg",
    reducedMotion: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Adds the `no-animations` class so TaskRow disables bounce/slide transitions while preserving layout rhythm.",
      },
    },
  },
};
