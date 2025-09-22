import type { GallerySectionId } from "./registry";

export type GallerySectionGroupKey =
  | "primitives"
  | "components"
  | "complex"
  | "tokens";

export interface GalleryHeroCopy {
  eyebrow: string;
  heading: string;
  subtitle: string;
}

export interface GallerySectionMeta {
  id: GallerySectionId;
  label?: string;
  copy: GalleryHeroCopy;
}

export interface GallerySectionGroupMeta {
  id: GallerySectionGroupKey;
  label: string;
  copy: GalleryHeroCopy;
  sections: readonly GallerySectionMeta[];
}

export const GALLERY_SECTION_GROUPS: readonly GallerySectionGroupMeta[] = [
  {
    id: "primitives",
    label: "Primitives",
    copy: {
      eyebrow: "Interaction basics",
      heading: "Planner interface primitives",
      subtitle:
        "Buttons, inputs, toggles, and feedback cues that keep everyday flows quick.",
    },
    sections: [
      {
        id: "buttons",
        copy: {
          eyebrow: "Action triggers",
          heading: "Action-ready button components",
          subtitle:
            "Primary, segmented, and icon buttons that keep Planner workflows moving.",
        },
      },
      {
        id: "inputs",
        copy: {
          eyebrow: "Data entry",
          heading: "Focused input components",
          subtitle:
            "Fields, textareas, and selectors tuned for confident capture and review.",
        },
      },
      {
        id: "toggles",
        copy: {
          eyebrow: "Preferences",
          heading: "Toggle and control components",
          subtitle:
            "Switches and selectors that flip Planner settings instantly.",
        },
      },
      {
        id: "feedback",
        copy: {
          eyebrow: "Status",
          heading: "Feedback and state components",
          subtitle:
            "Spinners, skeletons, and snackbars for communicating system status.",
        },
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    copy: {
      eyebrow: "Patterns",
      heading: "Composable Planner components",
      subtitle:
        "Prompts, layout shells, and card frameworks that shape expressive surfaces.",
    },
    sections: [
      {
        id: "prompts",
        copy: {
          eyebrow: "Guidance",
          heading: "Prompt and messaging components",
          subtitle:
            "Dialogs, sheets, and toasts that deliver the right nudge at the right moment.",
        },
      },
      {
        id: "cards",
        copy: {
          eyebrow: "Summaries",
          heading: "Card and surface components",
          subtitle:
            "Progress cards and shells that package Planner insights cleanly.",
        },
      },
      {
        id: "layout",
        copy: {
          eyebrow: "Structure",
          heading: "Layout and container components",
          subtitle:
            "Shells, overlays, and navigation scaffolding that organize Planner surfaces.",
        },
      },
      {
        id: "page-header",
        copy: {
          eyebrow: "First impression",
          heading: "Hero and page header components",
          subtitle:
            "Framed intros, hero shells, and portrait accents for high-impact screens.",
        },
      },
      {
        id: "misc",
        copy: {
          eyebrow: "Utilities",
          heading: "Utility and experimental components",
          subtitle:
            "Supporting patterns and helpers that round out the system.",
        },
      },
    ],
  },
  {
    id: "complex",
    label: "Complex",
    copy: {
      eyebrow: "Workflows",
      heading: "Planner experience frameworks",
      subtitle:
        "Boards, dashboards, and companion surfaces that orchestrate end-to-end flows.",
    },
    sections: [
      {
        id: "homepage",
        copy: {
          eyebrow: "Landing",
          heading: "Homepage welcome surfaces",
          subtitle:
            "Hero frames, portraits, and quick actions that open Planner with energy.",
        },
      },
      {
        id: "reviews",
        copy: {
          eyebrow: "Insights",
          heading: "Review analysis surfaces",
          subtitle:
            "Score panels, scouting forms, and pillar tools tuned for match retrospectives.",
        },
      },
      {
        id: "planner",
        copy: {
          eyebrow: "Core surfaces",
          heading: "Planner navigation systems",
          subtitle:
            "Boards, schedules, and route controls that anchor day-to-day focus.",
        },
      },
      {
        id: "goals",
        copy: {
          eyebrow: "Progress",
          heading: "Goals tracking flows",
          subtitle:
            "Lists, reminders, and focus timers that keep momentum visible.",
        },
      },
      {
        id: "team",
        copy: {
          eyebrow: "Roster",
          heading: "Team collaboration surfaces",
          subtitle:
            "Champion lists, side selectors, and pillar badges for coordinating the squad.",
        },
      },
      {
        id: "components",
        copy: {
          eyebrow: "Library",
          heading: "Components workspace shells",
          subtitle:
            "Gallery scaffolding, theming controls, and reference frames for deep dives.",
        },
      },
      {
        id: "prompts",
        copy: {
          eyebrow: "Guidance",
          heading: "Prompts workspace surfaces",
          subtitle:
            "Lists, editors, and demos shaping Planner's coaching moments.",
        },
      },
    ],
  },
  {
    id: "tokens",
    label: "Tokens",
    copy: {
      eyebrow: "Foundations",
      heading: "Planner design tokens",
      subtitle:
        "Color, spacing, typography, motion, and effects that keep every surface aligned.",
    },
    sections: [],
  },
] as const;

