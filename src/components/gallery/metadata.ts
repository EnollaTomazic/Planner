import type { GallerySectionId } from "./registry";

export type GallerySectionGroupKey = "primitives" | "patterns" | "layouts";

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
      eyebrow: "Foundational UI",
      heading: "Planner interface primitives",
      subtitle:
        "Buttons, inputs, toggles, and feedback cues that make everyday actions immediate.",
    },
    sections: [
      {
        id: "buttons",
        label: "Buttons",
        copy: {
          eyebrow: "Actions",
          heading: "Buttons and triggers",
          subtitle:
            "Primary, segmented, and icon buttons for decisive Planner interactions.",
        },
      },
      {
        id: "inputs",
        label: "Inputs",
        copy: {
          eyebrow: "Capture",
          heading: "Inputs and fields",
          subtitle:
            "Text, selection, and form fields tuned for confident capture and review.",
        },
      },
      {
        id: "toggles",
        label: "Toggles",
        copy: {
          eyebrow: "Preferences",
          heading: "Toggles and selectors",
          subtitle:
            "Switches, selectors, and filters that personalize Planner without friction.",
        },
      },
      {
        id: "feedback",
        label: "Feedback",
        copy: {
          eyebrow: "State",
          heading: "Feedback and status",
          subtitle:
            "Spinners, skeletons, and inline alerts that keep status visible across flows.",
        },
      },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    copy: {
      eyebrow: "Reusable flows",
      heading: "Planner interaction patterns",
      subtitle:
        "Prompts, cards, and utilities that package guidance and insight for any surface.",
    },
    sections: [
      {
        id: "prompts",
        label: "Prompts",
        copy: {
          eyebrow: "Guidance",
          heading: "Prompts and messaging",
          subtitle:
            "Dialogs, sheets, and toasts that deliver the right coaching moment.",
        },
      },
      {
        id: "cards",
        label: "Cards",
        copy: {
          eyebrow: "Summaries",
          heading: "Cards and overviews",
          subtitle:
            "Progress and scouting cards that surface signal without noise.",
        },
      },
      {
        id: "misc",
        label: "Utilities",
        copy: {
          eyebrow: "Support",
          heading: "Utility patterns",
          subtitle:
            "Supporting components and helpers that round out Planner experiences.",
        },
      },
    ],
  },
  {
    id: "layouts",
    label: "Layouts",
    copy: {
      eyebrow: "Workspace structure",
      heading: "Planner layout systems",
      subtitle:
        "Shells, navigation, and dashboards that organize Planner's cross-squad work.",
    },
    sections: [
      {
        id: "layout",
        label: "Containers",
        copy: {
          eyebrow: "Structure",
          heading: "Layout and container systems",
          subtitle:
            "Shells, overlays, and scaffolds that frame Planner content with rhythm.",
        },
      },
      {
        id: "page-header",
        label: "Page headers",
        copy: {
          eyebrow: "Introductions",
          heading: "Hero and header layouts",
          subtitle:
            "Framed intros, hero shells, and portrait slots for standout screens.",
        },
      },
      {
        id: "homepage",
        label: "Homepage",
        copy: {
          eyebrow: "Landing",
          heading: "Homepage surfaces",
          subtitle:
            "Hero frames, portraits, and quick actions that open Planner with momentum.",
        },
      },
      {
        id: "reviews",
        label: "Reviews",
        copy: {
          eyebrow: "Insights",
          heading: "Review analysis layouts",
          subtitle:
            "Score panels, scouting forms, and pillar tools tuned for match retrospectives.",
        },
      },
      {
        id: "planner",
        label: "Planner",
        copy: {
          eyebrow: "Daily ops",
          heading: "Planner navigation surfaces",
          subtitle:
            "Boards, schedules, and route controls that anchor day-to-day focus.",
        },
      },
      {
        id: "goals",
        label: "Goals",
        copy: {
          eyebrow: "Progress",
          heading: "Goals tracking layouts",
          subtitle:
            "Lists, reminders, and focus timers that keep momentum visible.",
        },
      },
      {
        id: "team",
        label: "Team",
        copy: {
          eyebrow: "Roster",
          heading: "Team collaboration layouts",
          subtitle:
            "Champion lists, side selectors, and pillar badges for coordinating the squad.",
        },
      },
      {
        id: "components",
        label: "Workspace",
        copy: {
          eyebrow: "Library",
          heading: "Components workspace layouts",
          subtitle:
            "Gallery scaffolding, theming controls, and reference frames for deep dives.",
        },
      },
    ],
  },
] as const;

