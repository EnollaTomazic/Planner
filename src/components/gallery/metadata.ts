import type { GallerySectionId } from "./registry";

export type GallerySectionGroupKey =
  | "primitives"
  | "patterns"
  | "layouts"
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
      eyebrow: "Core controls",
      heading: "Planner interface primitives",
      subtitle:
        "Buttons, inputs, toggles, and feedback systems that keep everyday intent fast and clear.",
    },
    sections: [
      {
        id: "buttons",
        copy: {
          eyebrow: "Action",
          heading: "Buttons built for confident clicks",
          subtitle:
            "Primary, segmented, and icon triggers that keep Planner flows moving.",
        },
      },
      {
        id: "inputs",
        copy: {
          eyebrow: "Capture",
          heading: "Inputs that center focus",
          subtitle:
            "Fields, textareas, and selectors tuned for crisp data entry and review.",
        },
      },
      {
        id: "toggles",
        copy: {
          eyebrow: "Switching",
          heading: "Toggles for quick preference shifts",
          subtitle:
            "Switches and selectors that adjust Planner settings without friction.",
        },
      },
      {
        id: "feedback",
        copy: {
          eyebrow: "Status",
          heading: "Feedback that keeps teams informed",
          subtitle:
            "Spinners, skeletons, and snackbars that broadcast system clarity.",
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
        "Prompts, surfaces, and helper frames that coach the right next step.",
    },
    sections: [
      {
        id: "prompts",
        copy: {
          eyebrow: "Guidance",
          heading: "Messaging that nudges momentum",
          subtitle:
            "Dialogs, sheets, and banners that deliver timely coaching.",
        },
      },
      {
        id: "cards",
        copy: {
          eyebrow: "Summaries",
          heading: "Cards that package insights",
          subtitle:
            "Dash cards, stats, and list treatments that surface progress at a glance.",
        },
      },
      {
        id: "misc",
        label: "Utilities",
        copy: {
          eyebrow: "Helpers",
          heading: "Utility patterns that fill the gaps",
          subtitle:
            "Supporting widgets and experiments that round out Planner experiences.",
        },
      },
    ],
  },
  {
    id: "layouts",
    label: "Layouts",
    copy: {
      eyebrow: "Structured canvases",
      heading: "Planner layout systems",
      subtitle:
        "Shells, dashboards, and navigation scaffolding that keep squads aligned.",
    },
    sections: [
      {
        id: "layout",
        label: "Navigation & layout",
        copy: {
          eyebrow: "Frameworks",
          heading: "Layouts that stage the work",
          subtitle:
            "Shells, overlays, and split views that organize Planner canvases.",
        },
      },
      {
        id: "page-header",
        label: "Page headers",
        copy: {
          eyebrow: "Introductions",
          heading: "Headers that set the tone",
          subtitle:
            "Heroes, portraits, and kick-off frames that open key journeys.",
        },
      },
      {
        id: "homepage",
        copy: {
          eyebrow: "Landing",
          heading: "Home canvases that energize arrivals",
          subtitle:
            "Welcome flows, portraits, and quick actions that launch the day.",
        },
      },
      {
        id: "reviews",
        copy: {
          eyebrow: "Insights",
          heading: "Review workspaces for scouting",
          subtitle:
            "Match analysis boards and scouting forms tuned for rapid decisions.",
        },
      },
      {
        id: "planner",
        copy: {
          eyebrow: "Core surfaces",
          heading: "Planner backbones that steer focus",
          subtitle:
            "Boards, timelines, and navigation frames anchoring daily rhythm.",
        },
      },
      {
        id: "goals",
        copy: {
          eyebrow: "Progress",
          heading: "Goal trackers that sustain momentum",
          subtitle:
            "Lists, reminders, and focus tools that keep progress visible.",
        },
      },
      {
        id: "team",
        copy: {
          eyebrow: "Roster",
          heading: "Team collaboration hubs",
          subtitle:
            "Squad lists, selectors, and readiness boards for shared planning.",
        },
      },
      {
        id: "components",
        label: "Components workspace",
        copy: {
          eyebrow: "Library",
          heading: "Workspace layouts for component curation",
          subtitle:
            "Gallery scaffolding, theming controls, and deep-dive frames.",
        },
      },
    ],
  },
] as const;

