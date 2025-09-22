import type { Meta, StoryObj } from "@storybook/react";
import { ProjectList } from "@/components/planner";
import type { Project } from "@/components/planner";

const sampleProjects: Project[] = [
  { id: "alpha", name: "Alpha", done: false, createdAt: Date.now() - 4000 },
  { id: "beta", name: "Beta", done: true, createdAt: Date.now() - 3000 },
  {
    id: "gamma",
    name: "Gamma (disabled)",
    done: false,
    createdAt: Date.now() - 2000,
    disabled: true,
  },
  {
    id: "delta",
    name: "Delta (syncing)",
    done: false,
    createdAt: Date.now() - 1000,
    loading: true,
  },
];

const noop = () => {};

const meta: Meta<typeof ProjectList> = {
  title: "Planner/ProjectList",
  component: ProjectList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Project rows now surface disabled and loading states via aria/data attributes so planner styles can respond.",
      },
    },
  },
  args: {
    projects: sampleProjects,
    selectedProjectId: "alpha",
    setSelectedProjectId: noop,
    setSelectedTaskId: noop,
    toggleProject: noop,
    renameProject: noop,
    deleteProject: noop,
    createProject: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof ProjectList>;

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Disabled rows expose `aria-disabled` while loading rows attach `data-loading` so semantic tokens show the correct feedback.",
      },
    },
  },
};
