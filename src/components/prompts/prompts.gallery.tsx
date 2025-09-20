import * as React from "react";
import {
  createGalleryPreview,
  defineGallerySection,
  type GalleryEntryKind,
  type GallerySection,
  type GallerySectionId,
} from "@/components/gallery/registry";
import {
  Badge,
  Button,
  Card,
  NeoCard,
  neoCardOverlayClassName,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  Input,
  Label,
  Sheet,
  Modal,
  Textarea,
  Toast,
  ThemePicker,
  BackgroundPicker,
  SettingsSelect,
  Progress,
  Split,
  TitleBar,
  AnimationToggle,
  CatCompanion,
  ThemeToggle,
  CheckCircle,
  Snackbar,
  Skeleton,
  SideSelector,
  PillarBadge,
  PillarSelector,
  Hero,
  SearchBar,
  TabBar,
  NeomorphicHeroFrame,
  PageShell,
  SectionCard as UiSectionCard,
  Spinner,
} from "@/components/ui";
import { Check as CheckIcon } from "lucide-react";
import DemoHeader from "./DemoHeader";
import GoalListDemo from "./GoalListDemo";
import OutlineGlowDemo from "./OutlineGlowDemo";
import PromptList from "./PromptList";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import PromptsHeader from "./PromptsHeader";
import SpinnerShowcase from "./SpinnerShowcase";
import SnackbarShowcase from "./SnackbarShowcase";
import SkeletonShowcase from "./SkeletonShowcase";
import ToggleShowcase from "./ToggleShowcase";
import PageHeaderDemo from "./PageHeaderDemo";
import NeomorphicHeroFrameDemo from "./NeomorphicHeroFrameDemo";
import {
  DashboardCard,
  DashboardList,
  IsometricRoom,
  QuickActionGrid,
  HeroPortraitFrame,
  WelcomeHeroFigure,
} from "@/components/home";
import { NAV_ITEMS, type NavItem } from "@/components/chrome/nav-items";
import ChampListEditor from "@/components/team/ChampListEditor";
import {
  RoleSelector,
  ReviewListItem,
  LaneOpponentForm,
  ResultScoreSection,
  PillarsSelector as ReviewsPillarsSelector,
  TimestampMarkers,
  ReviewSurface,
  ReviewSliderTrack,
  ScoreMeter,
} from "@/components/reviews";
import type { PromptWithTitle } from "./types";
import type { Review, Role, Pillar } from "@/lib/types";
import { VARIANTS, defaultTheme } from "@/lib/theme";
import type { Background, Variant } from "@/lib/theme";
import {
  GoalsProgress,
  RemindersTab,
  TimerRing,
  TimerTab,
} from "@/components/goals";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";
import { ProgressRingIcon, TimerRingIcon } from "@/icons";
import { cn } from "@/lib/utils";

type LegacySpec = {
  id: string;
  name: string;
  description?: string;
  element: React.ReactNode;
  tags: string[];
  props?: { label: string; value: string }[];
  code: string;
  states?: {
    id: string;
    name: string;
    description?: string;
    element: React.ReactNode;
    code?: string;
  }[];
  usage?: { kind: "do" | "dont"; title: string; description: string }[];
};

const demoPrompts: PromptWithTitle[] = [
  {
    id: "p1",
    title: "Demo prompt",
    text: "",
    createdAt: Date.now(),
  },
];

const demoReview: Review = {
  id: "r1",
  title: "Sample Review",
  notes: "Quick note",
  tags: [],
  pillars: [],
  createdAt: Date.now(),
  matchup: "Lux vs Ahri",
  role: "MID",
  score: 8,
  result: "Win",
};

const FIELD_HOVER_SHADOW =
  "shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)]";
const CHIP_FOCUS_RING =
  "ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[hsl(var(--surface-2))] outline-none";

type ChipState =
  | "hover"
  | "focus-visible"
  | "pressed"
  | "disabled"
  | "loading";

function PromptsHeaderChipStatePreview({ state }: { state: ChipState }) {
  const labelMap: Record<ChipState, string> = {
    hover: "Hover",
    "focus-visible": "Focus visible",
    pressed: "Pressed",
    disabled: "Disabled",
    loading: "Loading",
  };

  const isDisabled = state === "disabled" || state === "loading";

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-2)]">
      <Badge interactive>Default</Badge>
      <Badge
        interactive
        disabled={isDisabled}
        className={cn(
          "capitalize",
          state === "hover" && "bg-muted/28",
          state === "focus-visible" && CHIP_FOCUS_RING,
          state === "pressed" &&
            "bg-muted/36 translate-y-[var(--space-1)] shadow-badge",
          state === "loading" && "pointer-events-none",
        )}
        aria-pressed={state === "pressed" ? "true" : undefined}
      >
        <span>{labelMap[state]}</span>
        {state === "loading" ? (
          <Spinner
            size={16}
            className="ml-[var(--space-2)] border-[hsl(var(--ring))] border-t-transparent"
          />
        ) : null}
      </Badge>
    </div>
  );
}

type SearchState =
  | "hover"
  | "focus-visible"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "empty";

function PromptsHeaderSearchStatePreview({ state }: { state: SearchState }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const helperId = React.useId();
  const helperText = React.useMemo(() => {
    if (state === "error") {
      return "No prompts match \"reaction windows\".";
    }
    if (state === "empty") {
      return "Type to filter saved prompts.";
    }
    return undefined;
  }, [state]);

  React.useEffect(() => {
    if (state !== "focus-visible") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [state]);

  const valueMap: Record<SearchState, string> = {
    hover: "Focus cues",
    "focus-visible": "Focus cues",
    active: "Reaction windows",
    disabled: "Focus cues",
    loading: "Syncing prompts",
    error: "Reaction windows",
    empty: "",
  };

  const isDisabled = state === "disabled";
  const isLoading = state === "loading";
  const isError = state === "error";

  return (
    <Field.Root
      className={cn(
        "max-w-[min(100%,var(--space-72))]",
        state === "hover" && FIELD_HOVER_SHADOW,
      )}
      disabled={isDisabled}
      loading={isLoading}
      invalid={isError}
      helper={helperText}
      helperTone={isError ? "danger" : "muted"}
      helperId={helperText ? helperId : undefined}
    >
      <Field.Search
        ref={inputRef}
        placeholder="Search prompts…"
        aria-label="Search prompts"
        aria-describedby={helperText ? helperId : undefined}
        aria-invalid={isError ? "true" : undefined}
        value={valueMap[state]}
        readOnly
        clearable={state === "active"}
        onClear={state === "active" ? () => {} : undefined}
        disabled={isDisabled}
        loading={isLoading}
      />
    </Field.Root>
  );
}

type ComposeState =
  | "hover"
  | "focus-visible"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "empty";

function PromptsComposePanelStatePreview({ state }: { state: ComposeState }) {
  const titleId = React.useId();
  const titleHelperId = React.useId();
  const promptId = React.useId();
  const promptHelperId = React.useId();
  const titleRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (state !== "focus-visible") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [state]);

  const isDisabled = state === "disabled";
  const isLoading = state === "loading";
  const isError = state === "error";
  const isEmpty = state === "empty";

  const fieldAccentShadow =
    state === "active" ? "shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.08)]" : undefined;

  return (
    <div className="space-y-[var(--space-3)]">
      <div>
        <Label htmlFor={titleId}>Title</Label>
        <Input
          ref={titleRef}
          id={titleId}
          placeholder="Title"
          value={isEmpty || isError ? "" : "Review after scrims"}
          readOnly
          disabled={isDisabled}
          aria-invalid={isError ? "true" : undefined}
          aria-describedby={titleHelperId}
          data-loading={isLoading}
          className={cn(
            state === "hover" && FIELD_HOVER_SHADOW,
            fieldAccentShadow,
          )}
        >
          <CheckIcon
            aria-hidden="true"
            className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
          />
        </Input>
        <p
          id={titleHelperId}
          className={cn(
            "mt-[var(--space-1)] text-label",
            isError ? "text-danger" : "text-muted-foreground",
          )}
        >
          {isError ? "Title is required before saving." : "Add a short title"}
        </p>
      </div>
      <div>
        <Label htmlFor={promptId}>Prompt</Label>
        <Textarea
          id={promptId}
          placeholder="Write your prompt or snippet…"
          value={
            isEmpty
              ? ""
              : "Summarize three high-impact plays and next steps."
          }
          readOnly
          disabled={isDisabled}
          aria-invalid={isError ? "true" : undefined}
          aria-describedby={
            isEmpty ? promptHelperId : undefined
          }
          data-loading={isLoading}
          resize="resize-y"
          className={cn(
            state === "hover" && FIELD_HOVER_SHADOW,
            fieldAccentShadow,
          )}
        />
        {isEmpty ? (
          <p
            id={promptHelperId}
            className="mt-[var(--space-1)] text-label text-muted-foreground"
          >
            Describe the context or goal for this prompt.
          </p>
        ) : null}
      </div>
    </div>
  );
}

const SECTION_KIND_MAP: Record<GallerySectionId, GalleryEntryKind> = {
  buttons: "primitive",
  inputs: "primitive",
  toggles: "primitive",
  feedback: "primitive",
  prompts: "component",
  cards: "component",
  layout: "component",
  "page-header": "component",
  misc: "component",
  homepage: "complex",
  reviews: "complex",
  planner: "complex",
  goals: "complex",
  team: "complex",
  components: "complex",
};

function RoleSelectorDemo() {
  const [role, setRole] = React.useState<Role>("MID");
  return <RoleSelector value={role} onChange={setRole} />;
}
function ThemePickerDemo() {
  const [t, setT] = React.useState(defaultTheme());
  return (
    <ThemePicker
      variant={t.variant}
      onVariantChange={(v) => setT((prev) => ({ ...prev, variant: v }))}
    />
  );
}

function BackgroundPickerDemo() {
  const [t, setT] = React.useState(defaultTheme());
  return (
    <BackgroundPicker
      bg={t.bg}
      onBgChange={(b) => setT((prev) => ({ ...prev, bg: b }))}
    />
  );
}

function SettingsSelectDemo() {
  const [value, setValue] = React.useState<string>(VARIANTS[0]?.id ?? "");
  const items = React.useMemo(
    () => VARIANTS.map(({ id, label }) => ({ value: id, label })),
    [],
  );

  return (
    <div className="stack-sm">
      <SettingsSelect
        ariaLabel="Theme"
        prefixLabel="Theme"
        items={items}
        value={value}
        onChange={setValue}
      />
      <SettingsSelect
        ariaLabel="Theme (disabled)"
        prefixLabel="Theme (disabled)"
        items={items}
        value={value}
        onChange={setValue}
        disabled
      />
    </div>
  );
}

function useSelectOpen(
  rootRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
) {
  React.useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const trigger = root.querySelector<HTMLButtonElement>(
      "button[aria-haspopup=\"listbox\"]",
    );
    if (!trigger) return;
    if (trigger.getAttribute("aria-expanded") === "true") return;

    trigger.click();

    return () => {
      if (!trigger.isConnected) return;
      if (trigger.getAttribute("aria-expanded") === "true") {
        trigger.click();
      }
    };
  }, [open, rootRef]);
}

const HOVER_BG_TOKENS = "bg-[--hover] hover:bg-[--hover]";
const ACTIVE_BG_TOKENS = "bg-[--active] data-[open=true]:bg-[--active]";
const BUTTON_FOCUS_VISIBLE_TOKENS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]";
const WRAPPER_FOCUS_RING_TOKENS = "ring-2 ring-[var(--focus)]";
const THEME_TOGGLE_TRIGGER_SELECTOR = "[&_button[aria-haspopup='listbox']]";
const THEME_TOGGLE_HOVER_CLASS = `${THEME_TOGGLE_TRIGGER_SELECTOR}:bg-[--hover] ${THEME_TOGGLE_TRIGGER_SELECTOR}:hover:bg-[--hover]`;
const THEME_TOGGLE_FOCUS_CLASS = [
  `${THEME_TOGGLE_TRIGGER_SELECTOR}:outline-none`,
  `${THEME_TOGGLE_TRIGGER_SELECTOR}:ring-2`,
  `${THEME_TOGGLE_TRIGGER_SELECTOR}:ring-[var(--focus)]`,
  `focus-visible:${THEME_TOGGLE_TRIGGER_SELECTOR}:outline-none`,
  `focus-visible:${THEME_TOGGLE_TRIGGER_SELECTOR}:ring-2`,
  `focus-visible:${THEME_TOGGLE_TRIGGER_SELECTOR}:ring-[var(--focus)]`,
].join(" ");
const THEME_TOGGLE_ACTIVE_CLASS = `${THEME_TOGGLE_TRIGGER_SELECTOR}:bg-[--active]`;

type ThemePickerStatePreviewProps = {
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  openMenu?: boolean;
};

function ThemePickerStatePreview({
  className,
  buttonClassName,
  disabled = false,
  loading = false,
  openMenu = false,
}: ThemePickerStatePreviewProps) {
  const [variant, setVariant] = React.useState<Variant>(() => defaultTheme().variant);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  useSelectOpen(rootRef, openMenu);

  return (
    <div ref={rootRef} className="inline-flex">
      <ThemePicker
        variant={variant}
        onVariantChange={setVariant}
        className={className}
        buttonClassName={buttonClassName}
        disabled={disabled}
        loadingVariant={loading ? variant : null}
      />
    </div>
  );
}

function ThemePickerHoverState() {
  return <ThemePickerStatePreview buttonClassName={HOVER_BG_TOKENS} />;
}

function ThemePickerFocusState() {
  return (
    <ThemePickerStatePreview
      className={WRAPPER_FOCUS_RING_TOKENS}
      buttonClassName={BUTTON_FOCUS_VISIBLE_TOKENS}
    />
  );
}

function ThemePickerActiveState() {
  return (
    <ThemePickerStatePreview
      buttonClassName={ACTIVE_BG_TOKENS}
      openMenu
    />
  );
}

function ThemePickerDisabledState() {
  return <ThemePickerStatePreview disabled />;
}

function ThemePickerLoadingState() {
  return (
    <ThemePickerStatePreview
      buttonClassName={HOVER_BG_TOKENS}
      loading
      openMenu
    />
  );
}

type BackgroundPickerStatePreviewProps = {
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  openMenu?: boolean;
};

function BackgroundPickerStatePreview({
  className,
  buttonClassName,
  disabled = false,
  loading = false,
  openMenu = false,
}: BackgroundPickerStatePreviewProps) {
  const [bg, setBg] = React.useState<Background>(() => defaultTheme().bg);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  useSelectOpen(rootRef, openMenu);

  return (
    <div ref={rootRef} className="inline-flex">
      <BackgroundPicker
        bg={bg}
        onBgChange={setBg}
        className={className}
        buttonClassName={buttonClassName}
        disabled={disabled}
        loadingBackground={loading ? bg : null}
      />
    </div>
  );
}

function BackgroundPickerHoverState() {
  return <BackgroundPickerStatePreview buttonClassName={HOVER_BG_TOKENS} />;
}

function BackgroundPickerFocusState() {
  return (
    <BackgroundPickerStatePreview
      className={WRAPPER_FOCUS_RING_TOKENS}
      buttonClassName={BUTTON_FOCUS_VISIBLE_TOKENS}
    />
  );
}

function BackgroundPickerActiveState() {
  return (
    <BackgroundPickerStatePreview
      buttonClassName={ACTIVE_BG_TOKENS}
      openMenu
    />
  );
}

function BackgroundPickerDisabledState() {
  return <BackgroundPickerStatePreview disabled />;
}

function BackgroundPickerLoadingState() {
  return (
    <BackgroundPickerStatePreview
      buttonClassName={HOVER_BG_TOKENS}
      loading
      openMenu
    />
  );
}

type SettingsSelectStatePreviewProps = {
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  loadingIndex?: number | null;
  openMenu?: boolean;
};

function SettingsSelectStatePreview({
  className,
  buttonClassName,
  disabled = false,
  loadingIndex = null,
  openMenu = false,
}: SettingsSelectStatePreviewProps) {
  const [value, setValue] = React.useState<string>(VARIANTS[0]?.id ?? "");
  const items = React.useMemo(
    () =>
      VARIANTS.map(({ id, label }, index) => ({
        value: id,
        label,
        loading: loadingIndex === index,
      })),
    [loadingIndex],
  );
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  useSelectOpen(rootRef, openMenu);

  return (
    <div ref={rootRef} className="inline-flex">
      <SettingsSelect
        ariaLabel="Theme"
        prefixLabel="Theme"
        items={items}
        value={value}
        onChange={setValue}
        className={className}
        buttonClassName={buttonClassName}
        disabled={disabled}
      />
    </div>
  );
}

function SettingsSelectHoverState() {
  return <SettingsSelectStatePreview buttonClassName={HOVER_BG_TOKENS} />;
}

function SettingsSelectFocusState() {
  return (
    <SettingsSelectStatePreview
      className={WRAPPER_FOCUS_RING_TOKENS}
      buttonClassName={BUTTON_FOCUS_VISIBLE_TOKENS}
    />
  );
}

function SettingsSelectActiveState() {
  return (
    <SettingsSelectStatePreview
      buttonClassName={ACTIVE_BG_TOKENS}
      openMenu
    />
  );
}

function SettingsSelectDisabledState() {
  return <SettingsSelectStatePreview disabled />;
}

function SettingsSelectLoadingState() {
  return (
    <SettingsSelectStatePreview
      buttonClassName={HOVER_BG_TOKENS}
      loadingIndex={0}
      openMenu
    />
  );
}

type ThemeToggleStatePreviewProps = {
  className?: string;
  openMenu?: boolean;
  cycleDisabled?: boolean;
  cycleLoading?: boolean;
};

function ThemeToggleStatePreview({
  className,
  openMenu = false,
  cycleDisabled = false,
  cycleLoading = false,
}: ThemeToggleStatePreviewProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  useSelectOpen(rootRef, openMenu);

  return (
    <div ref={rootRef} className="inline-flex">
      <ThemeToggle
        ariaLabel="Theme toggle demo"
        className={cn(className)}
        cycleDisabled={cycleDisabled}
        cycleLoading={cycleLoading}
      />
    </div>
  );
}

function ThemeToggleHoverState() {
  return <ThemeToggleStatePreview className={THEME_TOGGLE_HOVER_CLASS} />;
}

function ThemeToggleFocusState() {
  return <ThemeToggleStatePreview className={THEME_TOGGLE_FOCUS_CLASS} />;
}

function ThemeToggleActiveState() {
  return (
    <ThemeToggleStatePreview
      className={`${THEME_TOGGLE_ACTIVE_CLASS} ${THEME_TOGGLE_HOVER_CLASS}`}
      openMenu
    />
  );
}

function ThemeToggleDisabledState() {
  return (
    <ThemeToggleStatePreview
      className="pointer-events-none opacity-[var(--disabled)]"
      cycleDisabled
    />
  );
}

function ThemeToggleLoadingState() {
  return <ThemeToggleStatePreview cycleLoading />;
}

type SideSelectorStatePreviewProps = {
  initialSide?: "Blue" | "Red";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

function SideSelectorStatePreview({
  initialSide = "Blue",
  className,
  disabled = false,
  loading = false,
}: SideSelectorStatePreviewProps) {
  const [side, setSide] = React.useState<"Blue" | "Red">(initialSide);

  return (
    <SideSelector
      value={side}
      onChange={setSide}
      className={cn(className)}
      disabled={disabled}
      loading={loading}
    />
  );
}

function SideSelectorHoverState() {
  return <SideSelectorStatePreview className="bg-[--hover]" />;
}

function SideSelectorFocusState() {
  return (
    <SideSelectorStatePreview className="ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]" />
  );
}

function SideSelectorActiveState() {
  return <SideSelectorStatePreview initialSide="Red" />;
}

function SideSelectorDisabledState() {
  return <SideSelectorStatePreview disabled />;
}

function SideSelectorLoadingState() {
  return <SideSelectorStatePreview loading />;
}

type ChampListEditorStatePreviewProps = {
  editing?: boolean;
  pillClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
};

function ChampListEditorStatePreview({
  editing = true,
  pillClassName,
  inputClassName,
  disabled = false,
}: ChampListEditorStatePreviewProps) {
  const [list, setList] = React.useState<string[]>(["Ashe", "Lulu"]);

  return (
    <div
      className={cn(
        "flex max-w-full flex-col gap-[var(--space-2)]",
        disabled && "pointer-events-none opacity-[var(--disabled)]",
      )}
    >
      <ChampListEditor
        list={list}
        onChange={setList}
        editing={editing}
        emptyLabel="-"
        pillClassName={pillClassName}
        editPillClassName={pillClassName}
        inputClassName={inputClassName}
      />
    </div>
  );
}

function ChampListEditorHoverState() {
  return (
    <ChampListEditorStatePreview
      pillClassName="bg-[--hover] border-ring"
    />
  );
}

function ChampListEditorFocusState() {
  return (
    <ChampListEditorStatePreview
      inputClassName="ring-2 ring-[var(--theme-ring)] ring-offset-2 ring-offset-[var(--background)]"
    />
  );
}

function ChampListEditorActiveState() {
  return <ChampListEditorStatePreview />;
}

function ChampListEditorDisabledState() {
  return <ChampListEditorStatePreview disabled />;
}

type PillarBadgeStatePreviewProps = {
  active?: boolean;
  className?: string;
  disabled?: boolean;
};

function PillarBadgeStatePreview({
  active = false,
  className,
  disabled = false,
}: PillarBadgeStatePreviewProps) {
  return (
    <PillarBadge
      pillar="Vision"
      interactive
      active={active}
      disabled={disabled}
      className={cn(
        className,
        "transition",
        disabled && "pointer-events-none opacity-[var(--disabled)]",
      )}
    />
  );
}

function PillarBadgeHoverState() {
  return <PillarBadgeStatePreview className="shadow-neo-strong" />;
}

function PillarBadgeFocusState() {
  return (
    <PillarBadgeStatePreview className="ring-2 ring-[var(--theme-ring)] ring-offset-2 ring-offset-[var(--background)]" />
  );
}

function PillarBadgeActiveState() {
  return <PillarBadgeStatePreview active />;
}

function PillarBadgeDisabledState() {
  return <PillarBadgeStatePreview disabled />;
}

type PillarSelectorStatePreviewProps = {
  initialValue?: Pillar[];
  className?: string;
  disabled?: boolean;
};

function PillarSelectorStatePreview({
  initialValue = ["Wave"],
  className,
  disabled = false,
}: PillarSelectorStatePreviewProps) {
  const [pillars, setPillars] = React.useState<Pillar[]>(initialValue);

  return (
    <PillarSelector
      value={pillars}
      onChange={setPillars}
      className={cn(
        "max-w-full",
        className,
        disabled && "pointer-events-none opacity-[var(--disabled)]",
      )}
    />
  );
}

function PillarSelectorHoverState() {
  return (
    <PillarSelectorStatePreview className="rounded-card p-[var(--space-2)] shadow-[var(--shadow-neo-soft)]" />
  );
}

function PillarSelectorFocusState() {
  return (
    <PillarSelectorStatePreview className="rounded-card p-[var(--space-2)] ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]" />
  );
}

function PillarSelectorActiveState() {
  return <PillarSelectorStatePreview initialValue={["Wave", "Trading"]} />;
}

function PillarSelectorDisabledState() {
  return <PillarSelectorStatePreview disabled />;
}

type RoleSelectorStatePreviewProps = {
  initialRole?: Role;
  className?: string;
  disabled?: boolean;
};

function RoleSelectorStatePreview({
  initialRole = "MID",
  className,
  disabled = false,
}: RoleSelectorStatePreviewProps) {
  const [role, setRole] = React.useState<Role>(initialRole);

  return (
    <RoleSelector
      value={role}
      onChange={setRole}
      className={cn(
        "max-w-full",
        className,
        disabled && "pointer-events-none opacity-[var(--disabled)]",
      )}
    />
  );
}

function RoleSelectorHoverState() {
  return <RoleSelectorStatePreview className="shadow-[var(--shadow-neo-soft)]" />;
}

function RoleSelectorFocusState() {
  return (
    <RoleSelectorStatePreview className="ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[var(--btn-bg)]" />
  );
}

function RoleSelectorActiveState() {
  return <RoleSelectorStatePreview initialRole="BOT" />;
}

function RoleSelectorDisabledState() {
  return <RoleSelectorStatePreview disabled />;
}

function ReviewSurfaceDemo() {
  return (
    <ReviewSurface padding="md" tone="muted">
      <div className="text-ui text-foreground/70">Surface content</div>
    </ReviewSurface>
  );
}

type BottomNavState =
  | "default"
  | "active"
  | "disabled"
  | "syncing"
  | "hover"
  | "focus-visible";
type BottomNavDemoMode =
  | "combined"
  | "active"
  | "disabled"
  | "syncing"
  | "hover"
  | "focus-visible";
type BottomNavDemoItem = NavItem & { state: BottomNavState };

const BOTTOM_NAV_STATE_DETAILS: Array<{
  key: Exclude<BottomNavDemoMode, "combined">;
  title: string;
  description: string;
}> = [
  {
    key: "active",
    title: "Active tab",
    description:
      "Accent typography and the theme ring token pin the current Planner route.",
  },
  {
    key: "hover",
    title: "Hover tab",
    description:
      "Foreground copy brightens while motion-safe elevation nudges the button for pointer feedback.",
  },
  {
    key: "focus-visible",
    title: "Keyboard focus",
    description:
      "Press Tab to move focus; focus-visible:ring-[var(--theme-ring)] keeps keyboard users anchored with the theme ring.",
  },
  {
    key: "disabled",
    title: "Disabled tab",
    description:
      "Muted foreground copy with the global disabled opacity token communicates unavailable sections.",
  },
  {
    key: "syncing",
    title: "Syncing tab",
    description:
      "A compact spinner uses accent border tokens to show background sync progress next to the label.",
  },
];

function createBottomNavItems(mode: BottomNavDemoMode = "combined") {
  const states = new Map<string, BottomNavState>();

  NAV_ITEMS.forEach((item) => {
    states.set(item.href, "default");
  });

  if (mode === "combined" || mode === "active") {
    states.set("/planner", "active");
  }

  if (mode === "combined" || mode === "hover") {
    states.set("/goals", "hover");
  }

  if (mode === "combined" || mode === "focus-visible") {
    states.set("/components", "focus-visible");
  }

  if (mode === "combined" || mode === "syncing") {
    states.set("/reviews", "syncing");
  }

  if (mode === "combined" || mode === "disabled") {
    states.set("/team", "disabled");
  }

  return NAV_ITEMS.map<BottomNavDemoItem>((item) => ({
    ...item,
    state: states.get(item.href) ?? "default",
  }));
}

function BottomNavStatesDemo({ mode = "combined" }: { mode?: BottomNavDemoMode }) {
  const items = React.useMemo(() => createBottomNavItems(mode), [mode]);

  return (
    <div className="space-y-[var(--space-4)]">
      <nav
        aria-label="Planner bottom navigation"
        className="rounded-card r-card-lg border border-border bg-surface-2 px-[var(--space-4)] py-[var(--space-3)] shadow-neoSoft"
      >
        <ul className="flex items-stretch justify-around gap-[var(--space-2)]">
          {items.map(({ href, label, mobileIcon: Icon, state }) => {
            if (!Icon) {
              return null;
            }

            return (
              <li key={`${mode}-${href}`}>
                <button
                  type="button"
                  disabled={state === "disabled"}
                  aria-pressed={state === "active" ? true : undefined}
                  aria-busy={state === "syncing" ? true : undefined}
                  data-state={state}
                  className={cn(
                    "group flex min-h-[var(--control-h-lg)] flex-col items-center gap-[var(--space-1)] rounded-card r-card-md px-[var(--space-5)] py-[var(--space-3)] text-label font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-[var(--disabled)] motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
                    state === "active" &&
                      "text-accent-3 ring-2 ring-[var(--theme-ring)]",
                    state === "hover" &&
                      "text-foreground motion-safe:-translate-y-0.5 motion-reduce:transform-none",
                    state === "focus-visible" &&
                      "text-foreground ring-2 ring-[var(--theme-ring)] ring-offset-0",
                    state === "default" &&
                      "text-muted-foreground hover:text-foreground",
                    state === "disabled" && "text-muted-foreground/70",
                    state === "syncing" && "text-foreground",
                  )}
                >
                  <span className="[&_svg]:size-[var(--space-4)]">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-[var(--space-1)]">
                    {label}
                    {state === "syncing" ? (
                      <Spinner size="var(--space-3)" />
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {mode === "combined" ? (
        <dl className="grid gap-[var(--space-3)] text-label text-muted-foreground">
          {BOTTOM_NAV_STATE_DETAILS.map(({ key, title, description }) => (
            <div key={key} className="space-y-[var(--space-1)]">
              <dt className="text-ui font-semibold text-foreground">{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function ReviewSliderTrackDemo() {
  return (
    <ReviewSurface padding="inline" className="relative h-12">
      <ReviewSliderTrack value={7} tone="score" variant="input" />
    </ReviewSurface>
  );
}

function ScoreMeterDemo() {
  return <ScoreMeter label="Score" value={8} detail={<span>Great positioning</span>} />;
}

function ChampListEditorDemo() {
  const [editing, setEditing] = React.useState(true);
  const [list, setList] = React.useState<string[]>(["Ashe", "Lulu"]);

  return (
    <div className="space-y-[var(--space-3)]" data-scope="team">
      <div className="flex items-center justify-between">
        <span className="text-label font-semibold tracking-[0.02em] text-muted-foreground">
          Champions
        </span>
        <Button size="sm" onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
      <ChampListEditor
        list={list}
        onChange={setList}
        editing={editing}
        emptyLabel="-"
        viewClassName="champ-badges mt-[var(--space-1)] flex flex-wrap gap-[var(--space-2)]"
      />
    </div>
  );
}

function CardDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-ui">Body</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  );
}

function CardLoadingState() {
  return (
    <Card>
      <CardContent className="space-y-[var(--space-4)]">
        <div className="space-y-[var(--space-2)]">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading summary"
            className="h-[var(--space-6)] w-3/4"
            radius="sm"
          />
          <Skeleton className="w-full" />
          <Skeleton className="w-4/5" />
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <Skeleton
            className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
            radius="full"
          />
          <div className="flex-1 space-y-[var(--space-2)]">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CardErrorState() {
  return (
    <Card>
      <CardContent className="stack-md">
        <div className="stack-xs">
          <h4 className="text-ui font-semibold tracking-[-0.01em]">
            Data unavailable
          </h4>
          <p className="text-label text-muted-foreground">
            Refresh to request the latest match insights.
          </p>
        </div>
        <Snackbar
          message="Sync failed"
          actionLabel="Retry"
          onAction={() => {}}
          tone="danger"
          width="full"
        />
      </CardContent>
    </Card>
  );
}

function NeoCardDemo() {
  return (
    <NeoCard
      overlay={
        <div className={neoCardOverlayClassName} />
      }
    >
      <p className="text-ui">Body</p>
    </NeoCard>
  );
}

function NeoCardLoadingState() {
  return (
    <NeoCard>
      <div className="stack-lg">
        <div className="stack-sm">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading summary"
            className="h-[var(--space-6)] w-3/4"
            radius="sm"
          />
          <Skeleton className="w-full" />
          <Skeleton className="w-4/5" />
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <Skeleton
            className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
            radius="full"
          />
          <div className="flex-1 stack-sm">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-2/3" />
          </div>
        </div>
      </div>
    </NeoCard>
  );
}

function NeoCardErrorState() {
  return (
    <NeoCard>
      <div className="stack-md">
        <div className="stack-xs">
          <h4 className="text-ui font-semibold tracking-[-0.01em]">
            Overlay unavailable
          </h4>
          <p className="text-label text-muted-foreground">
            Refresh to retry the sync and restore overlay content.
          </p>
        </div>
        <Snackbar
          message="Sync failed"
          actionLabel="Retry"
          onAction={() => {}}
          tone="danger"
          width="full"
        />
      </div>
    </NeoCard>
  );
}

function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <Card>
          <CardHeader>
            <CardTitle>Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ui">Content</p>
          </CardContent>
        </Card>
      </Sheet>
    </>
  );
}

function SheetClosedState() {
  return (
    <Card className="max-w-sm space-y-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
      <CardHeader>
        <CardTitle>Sheet closed</CardTitle>
        <CardDescription>
          Use the trigger to lift the overlay from the base elevation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-[var(--space-2)]">
        <Button
          size="sm"
          className="shadow-[var(--shadow-control)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          Open sheet
        </Button>
      </CardContent>
    </Card>
  );
}

function SheetOpeningState() {
  return (
    <Sheet
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo-soft)]"
    >
      <CardHeader>
        <CardTitle>Syncing tasks</CardTitle>
        <CardDescription>
          Keep content visible while the sheet animates into place.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-[var(--space-3)] rounded-card border border-border/40 bg-surface-2 p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
        <Spinner size={20} />
        <span className="text-ui text-muted-foreground">Loading dashboard</span>
      </CardContent>
    </Sheet>
  );
}

function SheetFocusTrapState() {
  const primaryActionRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    primaryActionRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <Sheet
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo-strong)]"
    >
      <CardHeader>
        <CardTitle>Focus trapped</CardTitle>
        <CardDescription>
          Keyboard focus stays inside the sheet while it is open.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-2)]">
        <p className="text-ui text-muted-foreground">
          Tab navigation cycles through the available controls.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-[var(--space-2)]">
        <Button
          ref={primaryActionRef}
          size="sm"
          className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
        >
          Save
        </Button>
        <Button variant="ghost" size="sm" className="order-first">
          Cancel
        </Button>
      </CardFooter>
    </Sheet>
  );
}

function SheetConfirmState() {
  return (
    <Sheet
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo)]"
    >
      <CardHeader>
        <CardTitle>Archive reminders</CardTitle>
        <CardDescription>
          Keep confirm disabled until all checklist items are reviewed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-2)]">
        <div className="rounded-card border border-border/40 bg-surface p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
          <p className="text-ui text-muted-foreground">
            Archive includes 3 completed reminders.
          </p>
          <p className="text-ui text-muted-foreground">
            Complete the checklist to enable confirmation.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-[var(--space-2)]">
        <Button
          size="sm"
          disabled
          className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
        >
          Confirm
        </Button>
        <Button variant="ghost" size="sm" className="order-first">
          Cancel
        </Button>
      </CardFooter>
    </Sheet>
  );
}

function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ui">Content</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    </>
  );
}

function ModalClosedState() {
  return (
    <Card className="max-w-sm space-y-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
      <CardHeader>
        <CardTitle>Modal closed</CardTitle>
        <CardDescription>
          Trigger sits idle at the base elevation until needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-[var(--space-2)]">
        <Button
          size="sm"
          className="shadow-[var(--shadow-control)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          Open modal
        </Button>
      </CardContent>
    </Card>
  );
}

function ModalOpeningState() {
  return (
    <Modal
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo-soft)]"
    >
      <CardHeader>
        <CardTitle>Confirm selection</CardTitle>
        <CardDescription>
          Surface a loader while the dialog hydrates.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-[var(--space-3)] rounded-card border border-border/40 bg-surface-2 p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
        <Spinner size={20} />
        <span className="text-ui text-muted-foreground">Syncing choices...</span>
      </CardContent>
    </Modal>
  );
}

function ModalFocusTrapState() {
  const confirmRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    confirmRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <Modal
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo-strong)]"
    >
      <CardHeader>
        <CardTitle>Keyboard locked in</CardTitle>
        <CardDescription>
          Focus moves to the primary action while the trap is active.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-2)]">
        <p className="text-ui text-muted-foreground">
          Tab keeps focus within the modal until it closes.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-[var(--space-2)]">
        <Button
          ref={confirmRef}
          size="sm"
          className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
        >
          Confirm
        </Button>
        <Button variant="ghost" size="sm" className="order-first">
          Back
        </Button>
      </CardFooter>
    </Modal>
  );
}

function ModalConfirmState() {
  return (
    <Modal
      open
      onClose={() => {}}
      className="shadow-[var(--shadow-neo)]"
    >
      <CardHeader>
        <CardTitle>Delete board</CardTitle>
        <CardDescription>
          Keep destructive confirmations disabled until acknowledged.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-2)]">
        <div className="rounded-card border border-border/40 bg-surface p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
          <p className="text-ui text-muted-foreground">
            Deleting removes all tasks and cannot be undone.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-[var(--space-2)]">
        <Button
          size="sm"
          disabled
          className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
        >
          Delete
        </Button>
        <Button variant="ghost" size="sm" className="order-first">
          Cancel
        </Button>
      </CardFooter>
    </Modal>
  );
}

function ToastDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Show
      </Button>
      <Toast open={open} onOpenChange={setOpen} closable showProgress>
        <p className="text-ui">Toast message</p>
      </Toast>
    </>
  );
}

function PromptsHeaderDemo() {
  const [saved, setSaved] = React.useState(6);
  const [query, setQuery] = React.useState("focus");
  const handleSave = React.useCallback(() => {
    setSaved((prev) => prev + 1);
  }, []);

  return (
    <PromptsHeader
      count={saved}
      query={query}
      onQueryChange={setQuery}
      onSave={handleSave}
      disabled={query.trim().length === 0}
    />
  );
}

function PromptsComposePanelDemo() {
  const [title, setTitle] = React.useState("Review after scrims");
  const [text, setText] = React.useState(
    "Summarize three high-impact plays and next steps.",
  );

  return (
    <PromptsComposePanel
      title={title}
      onTitleChange={setTitle}
      text={text}
      onTextChange={setText}
    />
  );
}

function PromptListLoadingState() {
  return (
    <ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index}>
          <Card className="space-y-[var(--space-3)] p-[var(--space-3)]">
            <div className="flex items-center justify-between">
              <Skeleton
                ariaHidden={false}
                role="status"
                aria-label="Loading prompt title"
                className="h-[var(--space-5)] w-[calc(100%-var(--space-6))]"
                radius="sm"
              />
              <Skeleton
                className="h-[var(--space-4)] w-[calc(var(--space-8)*1.5)]"
                radius="sm"
              />
            </div>
            <div className="space-y-[var(--space-2)]">
              <Skeleton className="w-full" />
              <Skeleton className="w-[calc(100%-var(--space-6))]" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function PromptListEmptyState() {
  return <PromptList prompts={[]} query="" />;
}

function DemoHeaderShowcase() {
  const [role, setRole] = React.useState<Role>("MID");
  const [fruit, setFruit] = React.useState<string>("apple");

  return (
    <DemoHeader
      role={role}
      onRoleChange={setRole}
      fruit={fruit}
      onFruitChange={setFruit}
    />
  );
}
const LEGACY_SPEC_DATA: Record<GallerySectionId, LegacySpec[]> = {
  buttons: [],
  inputs: [],
  prompts: [
    {
      id: "prompt-list",
      name: "PromptList",
      description: "Prompt filtering",
      element: <PromptList prompts={demoPrompts} query="" />,
      tags: ["prompt", "list"],
      code: `<PromptList prompts={demoPrompts} query="" />`,
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Skeleton cards preserve the prompt layout while entries sync from storage.",
          element: <PromptListLoadingState />,
          code: `<ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
  {Array.from({ length: 3 }).map((_, index) => (
    <li key={index}>
      <Card className="space-y-[var(--space-3)] p-[var(--space-3)]">
        <div className="flex items-center justify-between">
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading prompt title"
            className="h-[var(--space-5)] w-[calc(100%-var(--space-6))]"
            radius="sm"
          />
          <Skeleton
            className="h-[var(--space-4)] w-[calc(var(--space-8)*1.5)]"
            radius="sm"
          />
        </div>
        <div className="space-y-[var(--space-2)]">
          <Skeleton className="w-full" />
          <Skeleton className="w-[calc(100%-var(--space-6))]" />
        </div>
      </Card>
    </li>
  ))}
</ul>`,
        },
        {
          id: "empty",
          name: "Empty",
          description:
            "Muted guidance keeps the workspace clear when no prompts have been saved yet.",
          element: <PromptListEmptyState />,
          code: `<PromptList prompts={[]} query="" />`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Match skeleton rhythm to saved cards",
          description:
            "Align placeholder spacing with prompt titles and bodies so loading feels stable.",
        },
        {
          kind: "do",
          title: "Confirm empty states with guidance",
          description:
            "Surface contextual copy that explains whether no prompts exist or filters removed results.",
        },
        {
          kind: "dont",
          title: "Avoid blank panels",
          description:
            "Never leave the list empty without skeletons or helper text; it reads as a rendering failure.",
        },
      ],
    },
    {
      id: "prompts-header",
      name: "PromptsHeader",
      description: "Prompts workspace header with search, chips, and save action.",
      element: <PromptsHeaderDemo />,
      tags: ["prompts", "header", "search"],
      code: `function PromptsHeaderDemo() {
  const [saved, setSaved] = React.useState(6);
  const [query, setQuery] = React.useState("focus");

  return (
    <PromptsHeader
      count={saved}
      query={query}
      onQueryChange={setQuery}
      onSave={() => setSaved((prev) => prev + 1)}
      disabled={query.trim().length === 0}
    />
  );
}`,
      states: [
        {
          id: "chip-hover",
          name: "Chip hover",
          description:
            "The muted overlay token appears on hover so filter chips advertise interactivity without shifting layout.",
          element: <PromptsHeaderChipStatePreview state="hover" />,
          code: `<div className="flex flex-wrap items-center gap-[var(--space-2)]">
  <Badge interactive>Default</Badge>
  <Badge interactive className="bg-muted/28">
    Hover
  </Badge>
</div>`,
        },
        {
          id: "chip-focus-visible",
          name: "Chip focus-visible",
          description:
            "Focus rings use the global \`--focus\` token to keep keyboard navigation visible across themed surfaces.",
          element: <PromptsHeaderChipStatePreview state="focus-visible" />,
          code: `<div className="flex flex-wrap items-center gap-[var(--space-2)]">
  <Badge interactive>Default</Badge>
  <Badge
    interactive
    className="ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[hsl(var(--surface-2))] outline-none"
  >
    Focus visible
  </Badge>
</div>`,
        },
        {
          id: "chip-pressed",
          name: "Chip pressed",
          description:
            "Pressed chips dip by \`var(--space-1)\` and deepen the muted overlay so selection feedback remains tactile.",
          element: <PromptsHeaderChipStatePreview state="pressed" />,
          code: `<div className="flex flex-wrap items-center gap-[var(--space-2)]">
  <Badge interactive>Default</Badge>
  <Badge
    interactive
    aria-pressed="true"
    className="bg-muted/36 translate-y-[var(--space-1)] shadow-badge"
  >
    Pressed
  </Badge>
</div>`,
        },
        {
          id: "chip-disabled",
          name: "Chip disabled",
          description:
            "Disabled chips lean on the shared opacity token so unavailable filters fade without breaking rhythm.",
          element: <PromptsHeaderChipStatePreview state="disabled" />,
          code: `<div className="flex flex-wrap items-center gap-[var(--space-2)]">
  <Badge interactive>Default</Badge>
  <Badge interactive disabled>
    Disabled
  </Badge>
</div>`,
        },
        {
          id: "chip-loading",
          name: "Chip loading",
          description:
            "While sync runs the badge disables interaction and shows an accent spinner anchored by the spacing scale.",
          element: <PromptsHeaderChipStatePreview state="loading" />,
          code: `<div className="flex flex-wrap items-center gap-[var(--space-2)]">
  <Badge interactive>Default</Badge>
  <Badge
    interactive
    disabled
    className="pointer-events-none"
  >
    Loading
    <Spinner
      size={16}
      className="ml-[var(--space-2)] border-[hsl(var(--ring))] border-t-transparent"
    />
  </Badge>
</div>`,
        },
        {
          id: "search-hover",
          name: "Search hover",
          description:
            "Hovering the header search lifts the hairline shadow using the shared highlight token.",
          element: <PromptsHeaderSearchStatePreview state="hover" />,
          code: `<Field.Root
  className="max-w-[min(100%,var(--space-72))] shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)]"
>
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Focus cues"
    aria-label="Search prompts"
  />
</Field.Root>`,
        },
        {
          id: "search-focus-visible",
          name: "Search focus-visible",
          description:
            "Auto focus applies the planner ring token so keyboard users keep orientation while filtering.",
          element: <PromptsHeaderSearchStatePreview state="focus-visible" />,
          code: `<Field.Root className="max-w-[min(100%,var(--space-72))]">
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Focus cues"
    autoFocus
    aria-label="Search prompts"
  />
</Field.Root>`,
        },
        {
          id: "search-active",
          name: "Search active",
          description:
            "Typing a query reveals the clear affordance so the chip filters and search stay in sync.",
          element: <PromptsHeaderSearchStatePreview state="active" />,
          code: `<Field.Root className="max-w-[min(100%,var(--space-72))]">
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Reaction windows"
    clearable
    onClear={() => {}}
    aria-label="Search prompts"
  />
</Field.Root>`,
        },
        {
          id: "search-disabled",
          name: "Search disabled",
          description:
            "When search is disabled, tokens desaturate the field and the clear control stays hidden.",
          element: <PromptsHeaderSearchStatePreview state="disabled" />,
          code: `<Field.Root className="max-w-[min(100%,var(--space-72))]" disabled>
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Focus cues"
    disabled
    aria-label="Search prompts"
  />
</Field.Root>`,
        },
        {
          id: "search-loading",
          name: "Search loading",
          description:
            "The loading state locks the field and shows the inline spinner supplied by the field primitive.",
          element: <PromptsHeaderSearchStatePreview state="loading" />,
          code: `<Field.Root className="max-w-[min(100%,var(--space-72))]" loading>
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Syncing prompts"
    loading
    aria-label="Search prompts"
  />
</Field.Root>`,
        },
        {
          id: "search-error",
          name: "Search error",
          description:
            "Danger helpers and border tokens communicate empty matches without collapsing the layout.",
          element: <PromptsHeaderSearchStatePreview state="error" />,
          code: `<Field.Root
  className="max-w-[min(100%,var(--space-72))]"
  invalid
  helper="No prompts match \"reaction windows\"."
  helperTone="danger"
  helperId="search-error"
>
  <Field.Search
    placeholder="Search prompts…"
    defaultValue="Reaction windows"
    aria-label="Search prompts"
    aria-describedby="search-error"
    aria-invalid="true"
  />
</Field.Root>`,
        },
        {
          id: "search-empty",
          name: "Search empty",
          description:
            "An empty helper keeps guidance visible when no query is applied yet.",
          element: <PromptsHeaderSearchStatePreview state="empty" />,
          code: `<Field.Root
  className="max-w-[min(100%,var(--space-72))]"
  helper="Type to filter saved prompts."
  helperId="search-helper"
>
  <Field.Search
    placeholder="Search prompts…"
    aria-label="Search prompts"
    aria-describedby="search-helper"
  />
</Field.Root>`,
        },
      ],
    },
    {
      id: "prompts-compose-panel",
      name: "PromptsComposePanel",
      description: "Compose prompts with labelled title and textarea controls.",
      element: <PromptsComposePanelDemo />,
      tags: ["prompts", "form"],
      code: `function PromptsComposePanelDemo() {
  const [title, setTitle] = React.useState("Review after scrims");
  const [text, setText] = React.useState(
    "Summarize three high-impact plays and next steps.",
  );

  return (
    <PromptsComposePanel
      title={title}
      onTitleChange={setTitle}
      text={text}
      onTextChange={setText}
    />
  );
}`,
      states: [
        {
          id: "compose-hover",
          name: "Compose hover",
          description:
            "Hovering either field lifts the shared highlight shadow while preserving the matte prompt shell.",
          element: <PromptsComposePanelStatePreview state="hover" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      defaultValue="Review after scrims"
      className="shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)]"
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      resize="resize-y"
      className="shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)]"
    />
  </div>
</div>`,
        },
        {
          id: "compose-focus-visible",
          name: "Compose focus-visible",
          description:
            "Focus-visible rings lean on the planner ring token so keyboard users keep context while editing prompts.",
          element: <PromptsComposePanelStatePreview state="focus-visible" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      defaultValue="Review after scrims"
      autoFocus
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      resize="resize-y"
    />
  </div>
</div>`,
        },
        {
          id: "compose-active",
          name: "Compose active",
          description:
            "Active editing introduces a subtle inset highlight so long-form prompts feel anchored while typing.",
          element: <PromptsComposePanelStatePreview state="active" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      defaultValue="Review after scrims"
      className="shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.08)]"
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      resize="resize-y"
      className="shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.08)]"
    />
  </div>
</div>`,
        },
        {
          id: "compose-disabled",
          name: "Compose disabled",
          description:
            "Disabled compose fields lean on the shared disabled opacity and remove pointer cues while saves settle.",
          element: <PromptsComposePanelStatePreview state="disabled" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      defaultValue="Review after scrims"
      disabled
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      resize="resize-y"
      disabled
    />
  </div>
</div>`,
        },
        {
          id: "compose-loading",
          name: "Compose loading",
          description:
            "Loading states trigger the field spinner via \`data-loading\` so writers know saves are in progress.",
          element: <PromptsComposePanelStatePreview state="loading" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      defaultValue="Review after scrims"
      data-loading
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      resize="resize-y"
      data-loading
    />
  </div>
</div>`,
        },
        {
          id: "compose-error",
          name: "Compose error",
          description:
            "Danger helpers communicate required titles, keeping validation inline with the prompt scaffold.",
          element: <PromptsComposePanelStatePreview state="error" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
      aria-invalid="true"
      aria-describedby="prompt-title-error"
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p
      id="prompt-title-error"
      className="mt-[var(--space-1)] text-label text-danger"
    >
      Title is required before saving.
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      defaultValue="Summarize three high-impact plays and next steps."
      aria-invalid="true"
      resize="resize-y"
    />
  </div>
</div>`,
        },
        {
          id: "compose-empty",
          name: "Compose empty",
          description:
            "Empty compose fields keep helper copy visible so players know what to write before saving.",
          element: <PromptsComposePanelStatePreview state="empty" />,
          code: `<div className="space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="prompt-title">Title</Label>
    <Input
      id="prompt-title"
      placeholder="Title"
    >
      <CheckIcon
        aria-hidden="true"
        className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 h-[var(--space-4)] w-[var(--space-4)]"
      />
    </Input>
    <p className="mt-[var(--space-1)] text-label text-muted-foreground">
      Add a short title
    </p>
  </div>
  <div>
    <Label htmlFor="prompt-body">Prompt</Label>
    <Textarea
      id="prompt-body"
      placeholder="Write your prompt or snippet…"
      aria-describedby="prompt-body-helper"
      resize="resize-y"
    />
    <p
      id="prompt-body-helper"
      className="mt-[var(--space-1)] text-label text-muted-foreground"
    >
      Describe the context or goal for this prompt.
    </p>
  </div>
</div>`,
        },
      ],
    },
    {
      id: "prompts-demos",
      name: "PromptsDemos",
      description: "Comprehensive component playground for prompts surfaces.",
      element: <PromptsDemos />,
      tags: ["prompts", "gallery", "demo"],
      code: `<PromptsDemos />`,
    },
  ],
  planner: [
    {
      id: "bottom-nav",
      name: "BottomNav",
      description:
        "Mobile Planner nav demo showing active, hover, focus-visible, disabled, and syncing tabs styled with tokens.",
      element: <BottomNavStatesDemo />,
      tags: ["nav", "bottom"],
      code: `<BottomNavStatesDemo />`,
      states: [
        {
          id: "active",
          name: "Active tab",
          description:
            "Accent text plus the theme ring token anchor the current Planner route.",
          element: <BottomNavStatesDemo mode="active" />,
          code: `<BottomNavStatesDemo mode="active" />`,
        },
        {
          id: "hover",
          name: "Hover tab",
          description:
            "Cursor hover brightens the label and nudges the button using motion-safe elevation cues.",
          element: <BottomNavStatesDemo mode="hover" />,
          code: `<BottomNavStatesDemo mode="hover" />`,
        },
        {
          id: "focus-visible",
          name: "Keyboard focus",
          description:
            "Press Tab to cycle across tabs; focus-visible:ring-[var(--theme-ring)] draws the accessible theme ring for keyboard travelers.",
          element: <BottomNavStatesDemo mode="focus-visible" />,
          code: `<BottomNavStatesDemo mode="focus-visible" />`,
        },
        {
          id: "disabled",
          name: "Disabled tab",
          description:
            "Muted foreground copy and the global disabled opacity token signal unavailable sections.",
          element: <BottomNavStatesDemo mode="disabled" />,
          code: `<BottomNavStatesDemo mode="disabled" />`,
        },
        {
          id: "syncing",
          name: "Syncing tab",
          description:
            "A compact spinner with accent borders communicates background sync progress beside the label.",
          element: <BottomNavStatesDemo mode="syncing" />,
          code: `<BottomNavStatesDemo mode="syncing" />`,
        },
      ],
    },
  ],
  cards: [
    {
      id: "card-demo",
      name: "Card",
      description:
        "Standard card surface with header spacing set to the space-2 token for consistent vertical rhythm.",
      element: <CardDemo />,
      tags: ["card", "layout"],
      code: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-ui">Body</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`,
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Skeleton placeholders mirror card layout to communicate asynchronous loading.",
          element: <CardLoadingState />,
          code: `<Card>
  <CardContent className="space-y-[var(--space-4)]">
    <div className="space-y-[var(--space-2)]">
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading summary"
        className="h-[var(--space-6)] w-3/4"
        radius="sm"
      />
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
    </div>
    <div className="flex items-center gap-[var(--space-3)]">
      <Skeleton
        className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
        radius="full"
      />
      <div className="flex-1 space-y-[var(--space-2)]">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  </CardContent>
</Card>`,
        },
        {
          id: "error",
          name: "Error",
          description:
            "Snackbar feedback surfaces failure messaging with a retry action inside the card shell.",
          element: <CardErrorState />,
          code: `<Card>
  <CardContent className="space-y-[var(--space-3)]">
    <div className="space-y-[var(--space-1)]">
      <h4 className="text-ui font-semibold tracking-[-0.01em]">
        Data unavailable
      </h4>
      <p className="text-label text-muted-foreground">
        Refresh to request the latest match insights.
      </p>
    </div>
    <Snackbar
      message="Sync failed"
      actionLabel="Retry"
      onAction={() => {}}
      tone="danger"
      width="full"
    />
  </CardContent>
</Card>`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Use skeletons for async fetches",
          description:
            "Mirror the content hierarchy with Skeleton components so loading feels intentional and steady.",
        },
        {
          kind: "do",
          title: "Keep messaging concise",
          description:
            "Card headlines should be short and scannable to reinforce the surrounding dashboard context.",
        },
        {
          kind: "dont",
          title: "Do not mix button tones",
          description:
            "Cards should avoid multiple competing button tones; reserve the primary action for the footer.",
        },
      ],
    },
    {
      id: "neo-card-demo",
      name: "NeoCard",
      element: <NeoCardDemo />,
      tags: ["card", "overlay", "layout"],
      code: `<NeoCard
  overlay={<div className="neo-card__overlay" />}
>
  <p className="text-ui">Body</p>
</NeoCard>`,
      states: [
        {
          id: "loading",
          name: "Loading",
          description:
            "Neo shell supports skeletons while preserving raised lighting cues.",
          element: <NeoCardLoadingState />,
          code: `<NeoCard className="p-[var(--space-4)]">
  <div className="space-y-[var(--space-4)]">
    <div className="space-y-[var(--space-2)]">
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading summary"
        className="h-[var(--space-6)] w-3/4"
        radius="sm"
      />
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
    </div>
    <div className="flex items-center gap-[var(--space-3)]">
      <Skeleton
        className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
        radius="full"
      />
      <div className="flex-1 space-y-[var(--space-2)]">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  </div>
</NeoCard>`,
        },
        {
          id: "error",
          name: "Error",
          description:
            "Surface retry messaging within the Neo overlay while maintaining blend effects.",
          element: <NeoCardErrorState />,
          code: `<NeoCard className="p-[var(--space-4)]">
  <div className="space-y-[var(--space-3)]">
    <div className="space-y-[var(--space-1)]">
      <h4 className="text-ui font-semibold tracking-[-0.01em]">
        Overlay unavailable
      </h4>
      <p className="text-label text-muted-foreground">
        Refresh to retry the sync and restore overlay content.
      </p>
    </div>
    <Snackbar
      message="Sync failed"
      actionLabel="Retry"
      onAction={() => {}}
      tone="danger"
      width="full"
    />
  </div>
</NeoCard>`,
        },
      ],
      usage: [
        {
          kind: "do",
          title: "Use overlays for featured content",
          description:
            "Neo cards work best when highlighting premium or hero content that benefits from glow and depth.",
        },
        {
          kind: "dont",
          title: "Avoid dense layouts",
          description:
            "Do not overload Neo cards with complex forms; reserve them for concise summaries or highlights.",
        },
      ],
    },
    {
      id: "section-card-variants",
      name: "SectionCard Variants",
      element: (
        <div className="flex flex-col gap-[var(--space-4)]">
          <UiSectionCard>
            <UiSectionCard.Header title="Neo (default)" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
          <UiSectionCard variant="plain">
            <UiSectionCard.Header title="Plain" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
        </div>
      ),
      tags: ["section", "card"],
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <SectionCard>
    <SectionCard.Header title="Neo (default)" />
    <SectionCard.Body>Content</SectionCard.Body>
  </SectionCard>
  <SectionCard variant="plain">
    <SectionCard.Header title="Plain" />
    <SectionCard.Body>Content</SectionCard.Body>
  </SectionCard>
</div>`,
    },
  ],
  layout: [
    {
      id: "page-shell",
      name: "PageShell",
      description:
        "Responsive page container. Enable the grid prop and wrap sections in col-span-* to align to the shell template.",
      element: (
        <PageShell
          grid
          className="py-[var(--space-6)]"
          contentClassName="items-start"
        >
          <div className="col-span-full text-label font-semibold tracking-[0.02em] text-muted-foreground md:col-span-7">
            Page shell content
          </div>
          <div className="col-span-full flex items-center justify-end gap-[var(--space-3)] md:col-span-5 md:justify-self-end">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="ghost">
              Secondary
            </Button>
          </div>
        </PageShell>
      ),
      tags: ["layout", "shell"],
      code: `<PageShell
  grid
  className="py-[var(--space-6)]"
  contentClassName="items-start"
>
  <div className="col-span-full text-label font-semibold tracking-[0.02em] text-muted-foreground md:col-span-7">
    Page shell content
  </div>
  <div className="col-span-full flex items-center justify-end gap-[var(--space-3)] md:col-span-5 md:justify-self-end">
    <Button size="sm">Primary</Button>
    <Button size="sm" variant="ghost">
      Secondary
    </Button>
  </div>
</PageShell>`,
    },
    {
      id: "sheet-demo",
      name: "Sheet",
      element: <SheetDemo />,
      tags: ["sheet", "overlay"],
      code: `<Button size="sm">Open</Button>
<Sheet open>
  <Card>
    <CardHeader>
      <CardTitle>Sheet</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-ui">Content</p>
    </CardContent>
  </Card>
</Sheet>`,
      states: [
        {
          id: "closed",
          name: "Closed",
          description:
            "Trigger rests on the base layer with the outline elevation token before the sheet opens.",
          element: <SheetClosedState />,
          code: `<Card className="max-w-sm space-y-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
  <CardHeader>
    <CardTitle>Sheet closed</CardTitle>
    <CardDescription>
      Use the trigger to lift the overlay from the base elevation.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex items-center gap-[var(--space-2)]">
    <Button
      size="sm"
      className="shadow-[var(--shadow-control)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
    >
      Open sheet
    </Button>
  </CardContent>
</Card>`,
        },
        {
          id: "opening",
          name: "Opening / loading",
          description:
            "Soft elevation token and spinner communicate progress while the sheet animates in.",
          element: <SheetOpeningState />,
          code: `<Sheet
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo-soft)]"
>
  <CardHeader>
    <CardTitle>Syncing tasks</CardTitle>
    <CardDescription>
      Keep content visible while the sheet animates into place.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex items-center gap-[var(--space-3)] rounded-card border border-border/40 bg-surface-2 p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
    <Spinner size={20} />
    <span className="text-ui text-muted-foreground">Loading dashboard</span>
  </CardContent>
</Sheet>`,
        },
        {
          id: "focus-trap",
          name: "Focus trapped",
          description:
            "Focus ring token highlights the primary action while the dialog trap holds keyboard focus.",
          element: <SheetFocusTrapState />,
          code: `const primaryActionRef = React.useRef<HTMLButtonElement | null>(null);
React.useEffect(() => {
  primaryActionRef.current?.focus({ preventScroll: true });
}, []);

<Sheet
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo-strong)]"
>
  <CardHeader>
    <CardTitle>Focus trapped</CardTitle>
    <CardDescription>
      Keyboard focus stays inside the sheet while it is open.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-[var(--space-2)]">
    <p className="text-ui text-muted-foreground">
      Tab navigation cycles through the available controls.
    </p>
  </CardContent>
  <CardFooter className="flex justify-end gap-[var(--space-2)]">
    <Button
      ref={primaryActionRef}
      size="sm"
      className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
    >
      Save
    </Button>
    <Button variant="ghost" size="sm" className="order-first">
      Cancel
    </Button>
  </CardFooter>
</Sheet>`,
        },
        {
          id: "confirm-disabled",
          name: "Confirm disabled",
          description:
            "Primary confirmation remains disabled until supporting requirements are met.",
          element: <SheetConfirmState />,
          code: `<Sheet
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo)]"
>
  <CardHeader>
    <CardTitle>Archive reminders</CardTitle>
    <CardDescription>
      Keep confirm disabled until all checklist items are reviewed.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-[var(--space-2)]">
    <div className="rounded-card border border-border/40 bg-surface p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
      <p className="text-ui text-muted-foreground">
        Archive includes 3 completed reminders.
      </p>
      <p className="text-ui text-muted-foreground">
        Complete the checklist to enable confirmation.
      </p>
    </div>
  </CardContent>
  <CardFooter className="flex justify-end gap-[var(--space-2)]">
    <Button
      size="sm"
      disabled
      className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
    >
      Confirm
    </Button>
    <Button variant="ghost" size="sm" className="order-first">
      Cancel
    </Button>
  </CardFooter>
</Sheet>`,
        },
      ],
    },
    {
      id: "modal-demo",
      name: "Modal",
      element: <ModalDemo />,
      tags: ["modal", "overlay"],
      code: `<Button size="sm">Open</Button>
<Modal open>
  <Card>
    <CardHeader>
      <CardTitle>Modal</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-ui">Content</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Close</Button>
    </CardFooter>
  </Card>
</Modal>`,
      states: [
        {
          id: "closed",
          name: "Closed",
          description:
            "Trigger sits on the outline elevation token until the modal is invoked.",
          element: <ModalClosedState />,
          code: `<Card className="max-w-sm space-y-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
  <CardHeader>
    <CardTitle>Modal closed</CardTitle>
    <CardDescription>
      Trigger sits idle at the base elevation until needed.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex items-center gap-[var(--space-2)]">
    <Button
      size="sm"
      className="shadow-[var(--shadow-control)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
    >
      Open modal
    </Button>
  </CardContent>
</Card>`,
        },
        {
          id: "loading",
          name: "Opening / loading",
          description:
            "Soft elevation token pairs with a spinner while the dialog content hydrates.",
          element: <ModalOpeningState />,
          code: `<Modal
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo-soft)]"
>
  <CardHeader>
    <CardTitle>Confirm selection</CardTitle>
    <CardDescription>
      Surface a loader while the dialog hydrates.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex items-center gap-[var(--space-3)] rounded-card border border-border/40 bg-surface-2 p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
    <Spinner size={20} />
    <span className="text-ui text-muted-foreground">Syncing choices...</span>
  </CardContent>
</Modal>`,
        },
        {
          id: "focus-trap",
          name: "Focus trapped",
          description:
            "Primary action receives the focus ring token while the trap keeps keyboard users inside the modal.",
          element: <ModalFocusTrapState />,
          code: `const confirmRef = React.useRef<HTMLButtonElement | null>(null);
React.useEffect(() => {
  confirmRef.current?.focus({ preventScroll: true });
}, []);

<Modal
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo-strong)]"
>
  <CardHeader>
    <CardTitle>Keyboard locked in</CardTitle>
    <CardDescription>
      Focus moves to the primary action while the trap is active.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-[var(--space-2)]">
    <p className="text-ui text-muted-foreground">
      Tab keeps focus within the modal until it closes.
    </p>
  </CardContent>
  <CardFooter className="flex justify-end gap-[var(--space-2)]">
    <Button
      ref={confirmRef}
      size="sm"
      className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
    >
      Confirm
    </Button>
    <Button variant="ghost" size="sm" className="order-first">
      Back
    </Button>
  </CardFooter>
</Modal>`,
        },
        {
          id: "confirm-disabled",
          name: "Confirm disabled",
          description:
            "Destructive confirmation stays disabled until the warning is acknowledged.",
          element: <ModalConfirmState />,
          code: `<Modal
  open
  onClose={() => {}}
  className="shadow-[var(--shadow-neo)]"
>
  <CardHeader>
    <CardTitle>Delete board</CardTitle>
    <CardDescription>
      Keep destructive confirmations disabled until acknowledged.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-[var(--space-2)]">
    <div className="rounded-card border border-border/40 bg-surface p-[var(--space-3)] shadow-[var(--shadow-outline-subtle)]">
      <p className="text-ui text-muted-foreground">
        Deleting removes all tasks and cannot be undone.
      </p>
    </div>
  </CardContent>
  <CardFooter className="flex justify-end gap-[var(--space-2)]">
    <Button
      size="sm"
      disabled
      className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
    >
      Delete
    </Button>
    <Button variant="ghost" size="sm" className="order-first">
      Cancel
    </Button>
  </CardFooter>
</Modal>`,
        },
      ],
    },
    {
      id: "split",
      name: "Split",
      element: (
        <Split
          left={<div className="p-[var(--space-4)]">Left</div>}
          right={<div className="p-[var(--space-4)]">Right</div>}
        />
      ),
      tags: ["split", "layout"],
      code: `<Split left={<div>Left</div>} right={<div>Right</div>} />`,
    },
    {
      id: "title-bar",
      name: "TitleBar",
      element: <TitleBar label="Title" />,
      tags: ["title", "bar"],
      code: `<TitleBar label="Title" />`,
    },
  ],
  "page-header": [
    {
      id: "neomorphic-hero-frame",
      name: "NeomorphicHeroFrame",
      description:
        "Composable neomorphic frame with semantic wrappers, tokenized spacing, and an action row for tabs, search, and buttons.",
      element: <NeomorphicHeroFrameDemo />,
      tags: ["hero", "layout", "tokens"],
      code: `<NeomorphicHeroFrame
  as="header"
  slots={{
    tabs: {
      node: (
        <TabBar
          items={[
            { key: "missions", label: "Missions" },
            { key: "briefings", label: "Briefings" },
            { key: "archive", label: "Archive", disabled: true },
          ]}
          value="missions"
          onValueChange={() => {}}
          ariaLabel="Switch mission focus"
          showBaseline
        />
      ),
      label: "Switch mission focus",
    },
    search: {
      node: (
        <SearchBar
          value=""
          onValueChange={() => {}}
          placeholder="Search mission intel…"
          aria-label="Search mission intel"
          loading
        />
      ),
      label: "Search mission intel",
    },
    actions: {
      node: (
        <div className="flex items-center gap-[var(--space-2)]">
          <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
          <Button size="sm" variant="primary" loading>
            Deploy
          </Button>
          <Button size="sm" variant="ghost" disabled>
            Disabled
          </Button>
        </div>
      ),
      label: "Mission quick actions",
    },
  }}
>
  <HeroGrid>
    <HeroCol span={7} className="space-y-[var(--space-3)]">
      <p className="text-ui text-muted-foreground">
        Default variant uses r-card-lg radius with px-6/md:px-7/lg:px-8 tokens and aligns content to the 12-column grid.
      </p>
    </HeroCol>
  </HeroGrid>
</NeomorphicHeroFrame>

<NeomorphicHeroFrame as="nav" variant="compact" align="between">
  <HeroGrid variant="compact">
    <HeroCol span={6}>
      <p className="text-ui text-muted-foreground">
        Compact variant swaps to r-card-md radius with px-4/md:px-5/lg:px-6 spacing.
      </p>
    </HeroCol>
  </HeroGrid>
</NeomorphicHeroFrame>`,
      states: [
        {
          id: "hero-tabs-hover",
          name: "Tabs — Hover",
          description:
            "Simulated hover applies the shadow-neo-soft token to lift the inactive hero tab without changing selection.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <TabBar
                items={[
                  { key: "missions", label: "Missions" },
                  {
                    key: "briefings",
                    label: "Briefings",
                    className: "shadow-neo-soft",
                  },
                  { key: "archive", label: "Archive", disabled: true },
                ]}
                value="missions"
                onValueChange={() => {}}
                ariaLabel="Preview hero tabs hover"
                variant="neo"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <TabBar
    items={[
      { key: "missions", label: "Missions" },
      {
        key: "briefings",
        label: "Briefings",
        className: "shadow-neo-soft",
      },
      { key: "archive", label: "Archive", disabled: true },
    ]}
    value="missions"
    onValueChange={() => {}}
    ariaLabel="Preview hero tabs hover"
    variant="neo"
  />
</div>`,
        },
        {
          id: "hero-tabs-focus",
          name: "Tabs — Focus-visible",
          description:
            "Focus preview layers the standard neon ring with shadow-neo-soft so the active hero tab reads clearly for keyboard users.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <TabBar
                items={[
                  {
                    key: "missions",
                    label: "Missions",
                    className:
                      "shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--card)/0.72)]",
                  },
                  { key: "briefings", label: "Briefings" },
                  { key: "archive", label: "Archive", disabled: true },
                ]}
                value="missions"
                onValueChange={() => {}}
                ariaLabel="Preview hero tabs focus"
                variant="neo"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <TabBar
    items={[
      {
        key: "missions",
        label: "Missions",
        className:
          "shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--card)/0.72)]",
      },
      { key: "briefings", label: "Briefings" },
      { key: "archive", label: "Archive", disabled: true },
    ]}
    value="missions"
    onValueChange={() => {}}
    ariaLabel="Preview hero tabs focus"
    variant="neo"
  />
</div>`,
        },
        {
          id: "hero-tabs-loading",
          name: "Tabs — Loading",
          description:
            "Loading state taps the built-in spinner and keeps the hovered glow via shadow-neo-soft while data syncs.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <TabBar
                items={[
                  { key: "missions", label: "Missions" },
                  {
                    key: "briefings",
                    label: "Briefings",
                    loading: true,
                    className: "shadow-neo-soft",
                  },
                  { key: "archive", label: "Archive", disabled: true },
                ]}
                value="missions"
                onValueChange={() => {}}
                ariaLabel="Preview hero tabs loading"
                variant="neo"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <TabBar
    items={[
      { key: "missions", label: "Missions" },
      {
        key: "briefings",
        label: "Briefings",
        loading: true,
        className: "shadow-neo-soft",
      },
      { key: "archive", label: "Archive", disabled: true },
    ]}
    value="missions"
    onValueChange={() => {}}
    ariaLabel="Preview hero tabs loading"
    variant="neo"
  />
</div>`,
        },
      ],
    },
    {
      id: "page-header-demo",
      name: "PageHeader",
      description:
        "Neomorphic hero header that defaults to a calm single-frame layout, forwards standard HTML attributes, and can be remapped with the as prop.",
      element: <PageHeaderDemo />,
      tags: ["hero", "header"],
      code: `<PageHeaderDemo />`,
      states: [
        {
          id: "page-header-search-focus",
          name: "Search — Focus-visible",
          description:
            "Focus ring pairs with shadow-neo-soft on the search field so keyboard focus mirrors the hero shell.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <SearchBar
                value="mission intel"
                onValueChange={() => {}}
                placeholder="Search mission intel…"
                aria-label="Search mission intel"
                fieldClassName="shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--bg))]"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <SearchBar
    value="mission intel"
    onValueChange={() => {}}
    placeholder="Search mission intel…"
    aria-label="Search mission intel"
    fieldClassName="shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--bg))]"
  />
</div>`,
        },
        {
          id: "page-header-search-loading",
          name: "Search — Loading",
          description:
            "Loading state mutes interactions and keeps the neo hover glow so progress is obvious without jitter.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <SearchBar
                value="briefings"
                onValueChange={() => {}}
                placeholder="Search mission intel…"
                aria-label="Search mission intel"
                loading
                fieldClassName="shadow-neo-soft"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <SearchBar
    value="briefings"
    onValueChange={() => {}}
    placeholder="Search mission intel…"
    aria-label="Search mission intel"
    loading
    fieldClassName="shadow-neo-soft"
  />
</div>`,
        },
        {
          id: "page-header-search-disabled",
          name: "Search — Disabled",
          description:
            "Disabled search keeps the field readable with reduced contrast while preserving the rounded neo shell.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <SearchBar
                value=""
                onValueChange={() => {}}
                placeholder="Search mission intel…"
                aria-label="Search mission intel"
                disabled
                fieldClassName="shadow-neo-soft"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <SearchBar
    value=""
    onValueChange={() => {}}
    placeholder="Search mission intel…"
    aria-label="Search mission intel"
    disabled
    fieldClassName="shadow-neo-soft"
  />
</div>`,
        },
      ],
    },
    {
      id: "demo-header",
      name: "DemoHeader",
      description:
        "Composite header, hero, banner, and review highlights wired together for hand-off demos.",
      element: <DemoHeaderShowcase />,
      tags: ["header", "hero", "layout"],
      code: `function DemoHeaderShowcase() {
  const [role, setRole] = React.useState("MID");
  const [fruit, setFruit] = React.useState("apple");

  return (
    <DemoHeader
      role={role}
      onRoleChange={setRole}
      fruit={fruit}
      onFruitChange={setFruit}
    />
  );
}`,
      states: [
        {
          id: "demo-header-cta-hover",
          name: "Primary CTA — Hover",
          description:
            "Primary action lifts with shadow-neo-soft to reflect the hover state used across hero quick actions.",
          element: (
            <div className="flex items-center gap-[var(--space-2)]">
              <Button size="sm" variant="primary" className="shadow-neo-soft">
                Launch event
              </Button>
            </div>
          ),
          code: `<div className="flex items-center gap-[var(--space-2)]">
  <Button size="sm" variant="primary" className="shadow-neo-soft">
    Launch event
  </Button>
</div>`,
        },
        {
          id: "demo-header-cta-focus",
          name: "Primary CTA — Focus-visible",
          description:
            "Focus-visible styling adds the shared neon ring on top of shadow-neo-soft so keyboard users get parity with hover.",
          element: (
            <div className="flex items-center gap-[var(--space-2)]">
              <Button
                size="sm"
                variant="primary"
                className="shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--card)/0.7)]"
              >
                Focused deploy
              </Button>
            </div>
          ),
          code: `<div className="flex items-center gap-[var(--space-2)]">
  <Button
    size="sm"
    variant="primary"
    className="shadow-neo-soft ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--card)/0.7)]"
  >
    Focused deploy
  </Button>
</div>`,
        },
        {
          id: "demo-header-cta-loading",
          name: "Primary CTA — Loading",
          description:
            "Loading CTA keeps the raised hover shadow while dimming interactions so progress reads instantly.",
          element: (
            <div className="flex items-center gap-[var(--space-2)]">
              <Button size="sm" variant="primary" loading className="shadow-neo-soft">
                Saving
              </Button>
            </div>
          ),
          code: `<div className="flex items-center gap-[var(--space-2)]">
  <Button size="sm" variant="primary" loading className="shadow-neo-soft">
    Saving
  </Button>
</div>`,
        },
        {
          id: "demo-header-cta-disabled",
          name: "Ghost CTA — Disabled",
          description:
            "Disabled secondary action leans on the built-in opacity tokens so the hero still communicates availability clearly.",
          element: (
            <div className="flex items-center gap-[var(--space-2)]">
              <Button size="sm" variant="ghost" disabled className="shadow-neo-soft">
                Disabled action
              </Button>
            </div>
          ),
          code: `<div className="flex items-center gap-[var(--space-2)]">
  <Button size="sm" variant="ghost" disabled className="shadow-neo-soft">
    Disabled action
  </Button>
</div>`,
        },
      ],
    },
    {
      id: "hero",
      name: "Hero",
      description:
        "Stacked hero shell with search and actions — default spacing plus frame-ready paddingless variant.",
      element: (
        <div className="space-y-[var(--space-4)]">
          <Hero
            heading="Hero"
            eyebrow="Eyebrow"
            subtitle="Subtitle"
            sticky={false}
            search={{ value: "", onValueChange: () => {}, round: true }}
            actions={<Button size="sm">Action</Button>}
          >
            <div className="text-ui text-muted-foreground">Body content</div>
          </Hero>
          <NeomorphicHeroFrame variant="dense">
            <Hero
              heading="Frame-ready hero"
              eyebrow="No padding"
              subtitle="Outer shell handles spacing"
              sticky={false}
              tone="supportive"
              frame={false}
              rail={false}
              padding="none"
            >
              <div className="text-ui text-muted-foreground">Body content</div>
            </Hero>
          </NeomorphicHeroFrame>
        </div>
      ),
      tags: ["hero", "layout"],
      code: `<Hero
  heading="Hero"
  eyebrow="Eyebrow"
  subtitle="Subtitle"
  sticky={false}
  search={{ value: "", onValueChange: () => {}, round: true }}
  actions={<Button size="sm">Action</Button>}
>
  <div className="text-ui text-muted-foreground">Body content</div>
</Hero>

<NeomorphicHeroFrame variant="dense">
  <Hero
    heading="Frame-ready hero"
    eyebrow="No padding"
    subtitle="Outer shell handles spacing"
    sticky={false}
    tone="supportive"
    frame={false}
    rail={false}
    padding="none"
  >
    <div className="text-ui text-muted-foreground">Body content</div>
  </Hero>
</NeomorphicHeroFrame>`,
      states: [
        {
          id: "hero-tabs-selected",
          name: "Sub tabs — Selected",
          description:
            "Active hero tab uses the accent gradient while shadow-neo-soft keeps the pill lifted inside the frame.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <TabBar
                items={[
                  { key: "missions", label: "Missions" },
                  {
                    key: "briefings",
                    label: "Briefings",
                    className: "shadow-neo-soft",
                  },
                  { key: "archive", label: "Archive", disabled: true },
                ]}
                value="briefings"
                onValueChange={() => {}}
                ariaLabel="Hero sub tab selected preview"
                variant="neo"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <TabBar
    items={[
      { key: "missions", label: "Missions" },
      {
        key: "briefings",
        label: "Briefings",
        className: "shadow-neo-soft",
      },
      { key: "archive", label: "Archive", disabled: true },
    ]}
    value="briefings"
    onValueChange={() => {}}
    ariaLabel="Hero sub tab selected preview"
    variant="neo"
  />
</div>`,
        },
        {
          id: "hero-tabs-disabled",
          name: "Sub tabs — Disabled",
          description:
            "Disabled hero tab inherits the dimmed opacity tokens while the rest of the bar keeps the neo hover treatment.",
          element: (
            <div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
              <TabBar
                items={[
                  { key: "missions", label: "Missions" },
                  { key: "briefings", label: "Briefings" },
                  { key: "archive", label: "Archive", disabled: true },
                ]}
                value="missions"
                onValueChange={() => {}}
                ariaLabel="Hero sub tab disabled preview"
                variant="neo"
              />
            </div>
          ),
          code: `<div className="rounded-card r-card-lg border border-border/45 bg-card/70 p-[var(--space-3)] shadow-neo-soft">
  <TabBar
    items={[
      { key: "missions", label: "Missions" },
      { key: "briefings", label: "Briefings" },
      { key: "archive", label: "Archive", disabled: true },
    ]}
    value="missions"
    onValueChange={() => {}}
    ariaLabel="Hero sub tab disabled preview"
    variant="neo"
  />
</div>`,
        },
      ],
    },
  ],
  feedback: [
    {
      id: "progress",
      name: "Progress",
      element: <Progress value={33} />,
      tags: ["progress"],
      code: `<Progress value={33} />`,
    },
    {
      id: "outline-glow",
      name: "OutlineGlowDemo",
      description: "Focus ring glow tokens and disabled outline states.",
      element: <OutlineGlowDemo />,
      tags: ["focus", "state", "demo"],
      code: `<div className="flex gap-[var(--space-2)]">
  <button
    type="button"
    className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface"
    style={{ "--focus": "var(--focus)" }}
  >
    Focus me to see the glow
  </button>
  <button
    type="button"
    disabled
    className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface disabled:cursor-not-allowed"
    style={{ "--focus": "var(--focus)" }}
  >
    Disabled example
  </button>
</div>`,
    },
    {
      id: "snackbar",
      name: "Snackbar",
      element: <SnackbarShowcase />,
      tags: ["snackbar", "feedback"],
      code: `<Snackbar message="Saved" actionLabel="Undo" onAction={() => {}} />`,
    },
    {
      id: "toast-demo",
      name: "Toast",
      element: <ToastDemo />,
      tags: ["toast", "feedback"],
      code: `<Button size="sm">Show</Button>
<Toast open closable showProgress><p className="text-ui">Toast message</p></Toast>`,
    },
    {
      id: "skeleton",
      name: "Skeleton",
      description: "Shimmer placeholder for loading layouts.",
      element: <SkeletonShowcase />,
      tags: ["skeleton", "loading", "feedback"],
      code: `<div className="space-y-2">
  <Skeleton
    ariaHidden={false}
    role="status"
    aria-label="Loading primary title"
    className="h-6 w-2/5 sm:w-1/3"
    radius="card"
  />
  <Skeleton className="w-3/4" />
  <Skeleton radius="full" className="h-10 w-10" />
</div>`,
    },
    {
      id: "spinner",
      name: "Spinner",
      element: <SpinnerShowcase />,
      tags: ["spinner", "loading"],
      code: `<Spinner size="var(--space-6)" />`,
    },
  ],
  toggles: [
    {
      id: "toggle",
      name: "Toggle",
      element: <ToggleShowcase />,
      tags: ["toggle"],
      code: `const [value, setValue] = React.useState<"Left" | "Right">("Left");
<Toggle value={value} onChange={setValue} />`,
    },
    {
      id: "animation-toggle",
      name: "AnimationToggle",
      element: (
        <div className="flex gap-4">
          <AnimationToggle />
          <AnimationToggle loading />
        </div>
      ),
      tags: ["toggle", "animation"],
      code: `<AnimationToggle />
<AnimationToggle loading />`,
    },
    {
      id: "check-circle",
      name: "CheckCircle",
      element: (
        <div className="flex gap-4">
          <CheckCircle
            aria-label="Enable notifications"
            checked={false}
            onChange={() => {}}
            size="md"
          />
          <CheckCircle
            aria-label="Enable notifications"
            checked
            onChange={() => {}}
            size="md"
          />
        </div>
      ),
      tags: ["checkbox", "toggle"],
      code: `<CheckCircle
  aria-label="Enable notifications"
  checked={false}
  onChange={() => {}}
  size="md"
/>
<CheckCircle
  aria-label="Enable notifications"
  checked
  onChange={() => {}}
  size="md"
/>`,
    },
  ],
  homepage: [
    {
      id: "dashboard-card",
      name: "DashboardCard",
      element: <DashboardCard title="Demo" />,
      tags: ["dashboard", "card"],
      code: `<DashboardCard title="Demo" />`,
    },
    {
      id: "dashboard-list",
      name: "DashboardList",
      element: (
        <DashboardList
          items={[
            { id: "sync", title: "Strategy sync", meta: "Today" },
            { id: "retro", title: "Retro prep", meta: "Wed" },
          ]}
          getKey={(item) => item.id}
          itemClassName="flex justify-between text-ui"
          empty="No highlights"
          renderItem={(item) => (
            <>
              <span>{item.title}</span>
              <span className="text-label text-muted-foreground">{item.meta}</span>
            </>
          )}
        />
      ),
      tags: ["dashboard", "list"],
      code: `<DashboardList
  items={[
    { id: "sync", title: "Strategy sync", meta: "Today" },
    { id: "retro", title: "Retro prep", meta: "Wed" },
  ]}
  getKey={(item) => item.id}
  itemClassName="flex justify-between text-ui"
  empty="No highlights"
  renderItem={(item) => (
    <>
      <span>{item.title}</span>
      <span className="text-label text-muted-foreground">{item.meta}</span>
    </>
  )}
/>`,
    },
    {
      id: "isometric-room",
      name: "IsometricRoom",
      element: <IsometricRoom variant="aurora" />,
      tags: ["room", "3d"],
      code: `<IsometricRoom variant="aurora" />`,
    },
    {
      id: "quick-action-grid",
      name: "QuickActionGrid",
      description: "Maps quick action configs to styled planner shortcuts",
      element: (
        <QuickActionGrid
          actions={[
            { href: "/planner", label: "Planner Today" },
            { href: "/goals", label: "New Goal", tone: "accent" },
            { href: "/reviews", label: "New Review", tone: "accent" },
          ]}
          layout="inline"
          buttonSize="lg"
          hoverLift
        />
      ),
      tags: ["actions", "planner"],
      code: `<QuickActionGrid
  actions={[
    { href: "/planner", label: "Planner Today" },
    { href: "/goals", label: "New Goal", tone: "accent" },
    { href: "/reviews", label: "New Review", tone: "accent" },
  ]}
  layout="inline"
  buttonSize="lg"
  hoverLift
/>`,
    },
    {
      id: "hero-portrait-frame",
      name: "HeroPortraitFrame",
      description:
        "Circular neumorphic portrait frame with lavender glow, glitch accent rim, and configurable `frame` toggle built from semantic tokens.",
      element: (
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
          <HeroPortraitFrame
            imageSrc="/hero_image.png"
            imageAlt="Illustration of the Planner hero floating above a holographic dashboard with full frame treatment"
          />
          <HeroPortraitFrame
            frame={false}
            imageSrc="/hero_image.png"
            imageAlt="Illustration of the Planner hero floating above a holographic dashboard without frame treatment"
          />
        </div>
      ),
      tags: ["hero", "portrait", "glitch"],
      code: `<div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
  <HeroPortraitFrame
    imageSrc="/hero_image.png"
    imageAlt="Illustration of the Planner hero floating above a holographic dashboard with full frame treatment"
  />
  <HeroPortraitFrame
    frame={false}
    imageSrc="/hero_image.png"
    imageAlt="Illustration of the Planner hero floating above a holographic dashboard without frame treatment"
  />
</div>`,
    },
    {
      id: "welcome-hero-figure",
      name: "WelcomeHeroFigure",
      description:
        "Hero automation figure framed in a haloed neumorphic ring with eager loading tuned for the landing experience.",
      element: (
        <div className="mx-auto flex w-full max-w-[calc(var(--space-8) * 5)] justify-center">
          <WelcomeHeroFigure />
        </div>
      ),
      tags: ["hero", "figure", "neomorphic"],
      code: `<WelcomeHeroFigure />`,
    },
  ],
  reviews: [
    {
      id: "review-surface",
      name: "ReviewSurface",
      element: (
        <div className="w-[calc(var(--space-8)*3.5)]">
          <ReviewSurfaceDemo />
        </div>
      ),
      tags: ["review", "surface"],
      code: `<div className="w-[calc(var(--space-8)*3.5)]">
  <ReviewSurface padding="md" tone="muted">
    <div className="text-ui text-foreground/70">Surface content</div>
  </ReviewSurface>
</div>`,
    },
    {
      id: "review-slider-track",
      name: "ReviewSliderTrack",
      element: (
        <div className="w-[calc(var(--space-8)*3.5)]">
          <ReviewSliderTrackDemo />
        </div>
      ),
      tags: ["review", "slider"],
      code: `<div className="w-[calc(var(--space-8)*3.5)]">
  <ReviewSurface padding="inline" className="relative h-12">
    <ReviewSliderTrack value={7} tone="score" variant="input" />
  </ReviewSurface>
</div>`,
    },
    {
      id: "score-meter",
      name: "ScoreMeter",
      element: (
        <div className="w-[calc(var(--space-8)*3.5)]">
          <ScoreMeterDemo />
        </div>
      ),
      tags: ["review", "slider", "summary"],
      code: `<div className="w-[calc(var(--space-8)*3.5)]">
  <ScoreMeter
    label="Score"
    value={8}
    detail={<span>Great positioning</span>}
  />
</div>`,
    },
    {
      id: "review-list-item",
      name: "ReviewListItem",
      element: <ReviewListItem review={demoReview} />,
      tags: ["review", "list"],
      code: `<ReviewListItem review={demoReview} />`,
    },
    {
      id: "lane-opponent-form",
      name: "LaneOpponentForm",
      element: (
        <LaneOpponentForm
          lane="Ashe/Lulu"
          opponent="Draven/Thresh"
          commitMeta={() => {}}
        />
      ),
      tags: ["lane", "opponent"],
      code: `<LaneOpponentForm lane="Ashe/Lulu" opponent="Draven/Thresh" commitMeta={() => {}} />`,
    },
    {
      id: "result-score-section",
      name: "ResultScoreSection",
      element: (
        <ResultScoreSection result="Win" score={5} commitMeta={() => {}} />
      ),
      tags: ["result", "score"],
      code: `<ResultScoreSection result="Win" score={5} commitMeta={() => {}} />`,
    },
    {
      id: "pillars-selector", // new component
      name: "PillarsSelector",
      element: <ReviewsPillarsSelector commitMeta={() => {}} pillars={[]} />,
      tags: ["pillars", "selector"],
      code: `<PillarsSelector pillars={[]} commitMeta={() => {}} />`,
    },
    {
      id: "timestamp-markers",
      name: "TimestampMarkers",
      element: <TimestampMarkers markers={[]} commitMeta={() => {}} />,
      tags: ["timestamp", "marker"],
      code: `<TimestampMarkers markers={[]} commitMeta={() => {}} />`,
    },
  ],
  goals: [
    {
      id: "goals-progress",
      name: "GoalsProgress",
      element: <GoalsProgress total={3} pct={50} />,
      tags: ["goals", "progress"],
      code: `<GoalsProgress total={3} pct={50} />`,
    },
    {
      id: "goal-list-demo",
      name: "GoalListDemo",
      element: <GoalListDemo />,
      tags: ["goal", "list"],
      code: `<GoalListDemo />`,
    },
    {
      id: "reminders-tab",
      name: "RemindersTab",
      element: (
        <RemindersProvider>
          <RemindersTab />
        </RemindersProvider>
      ),
      tags: ["reminders", "tab"],
      code: `<RemindersProvider>
  <RemindersTab />
</RemindersProvider>`,
    },
    {
      id: "timer-ring",
      name: "TimerRing",
      element: <TimerRing pct={42} />,
      tags: ["timer", "ring"],
      code: `<TimerRing pct={42} />`,
    },
    {
      id: "timer-tab",
      name: "TimerTab",
      element: <TimerTab />,
      tags: ["timer", "tab"],
      code: `<TimerTab />`,
    },
    {
      id: "progress-ring-icon",
      name: "ProgressRingIcon",
      element: <ProgressRingIcon pct={50} />,
      tags: ["icon", "progress"],
      code: `<ProgressRingIcon pct={50} />`,
    },
    {
      id: "timer-ring-icon",
      name: "TimerRingIcon",
      element: <TimerRingIcon pct={75} />,
      tags: ["icon", "timer"],
      code: `<TimerRingIcon pct={75} />`,
    },
  ],
  team: [
    {
      id: "side-selector",
      name: "SideSelector",
      element: (
        <div className="flex flex-col gap-4">
          <SideSelector />
          <SideSelector disabled />
        </div>
      ),
      tags: ["side", "selector"],
      code: `<SideSelector />
<SideSelector disabled />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "The accent hover wash previews the flicker animation for pointer users before they commit to a side.",
          element: <SideSelectorHoverState />,
          code: `<SideSelector
  value="Blue"
  onChange={() => {}}
  className="bg-[--hover]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Press Tab to land on the switch. The ring token outlines the control while Space/Enter flip teams and ← → choose Blue or Red directly.",
          element: <SideSelectorFocusState />,
          code: `<SideSelector
  value="Blue"
  onChange={() => {}}
  className="ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "Selecting Red slides the indicator and lights the right label. Space toggles sides, and the arrow keys jump the indicator without flicker.",
          element: <SideSelectorActiveState />,
          code: `<SideSelector value="Red" onChange={() => {}} />`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "The disabled opacity token keeps the rail visible while blocking Space, Enter, and arrow key input during lockouts.",
          element: <SideSelectorDisabledState />,
          code: `<SideSelector value="Blue" onChange={() => {}} disabled />`,
        },
        {
          id: "loading",
          name: "Loading",
          description:
            "While matchup data syncs, loading dims the selector and ignores toggles until the request resolves.",
          element: <SideSelectorLoadingState />,
          code: `<SideSelector value="Blue" onChange={() => {}} loading />`,
        },
      ],
    },
    {
      id: "champ-list-editor",
      name: "ChampListEditor",
      description: "Shared champion list editor with toggleable state.",
      element: <ChampListEditorDemo />,
      tags: ["champion", "editor"],
      code: `<ChampListEditor
  list={list}
  onChange={setList}
  editing={editing}
  emptyLabel="-"
  viewClassName="champ-badges mt-[var(--space-1)] flex flex-wrap gap-[var(--space-2)]"
/>`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "Hovering a badge in edit mode lifts it with the hover token so you can see which champion tag you are about to change.",
          element: <ChampListEditorHoverState />,
          code: `<ChampListEditor
  list={["Ashe", "Lulu"]}
  onChange={() => {}}
  editing
  pillClassName="bg-[--hover] border-ring"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Press Tab into the inline input to reveal the theme-ring outline; Enter creates a new slot and Backspace clears empty fields.",
          element: <ChampListEditorFocusState />,
          code: `<ChampListEditor
  list={["Ashe", "Lulu"]}
  onChange={() => {}}
  editing
  inputClassName="ring-2 ring-[var(--theme-ring)] ring-offset-2 ring-offset-[var(--background)]"
/>`,
        },
        {
          id: "active",
          name: "Active / editing",
          description:
            "Toggling editing exposes the glitch pill inputs so you can adjust the roster without leaving the review.",
          element: <ChampListEditorActiveState />,
          code: `<ChampListEditor
  list={["Ashe", "Lulu"]}
  onChange={() => {}}
  editing
/>`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "When a session locks, wrap the editor in the disabled opacity token to freeze both pointer and keyboard edits.",
          element: <ChampListEditorDisabledState />,
          code: `<div className="pointer-events-none opacity-[var(--disabled)]">
  <ChampListEditor
    list={["Ashe", "Lulu"]}
    onChange={() => {}}
    editing
  />
</div>`,
        },
      ],
    },
    {
      id: "pillar-badge",
      name: "PillarBadge",
      element: (
        <div className="flex gap-4">
          <PillarBadge pillar="Wave" />
          <PillarBadge pillar="Trading" active />
        </div>
      ),
      tags: ["pillar", "badge"],
      code: `<PillarBadge pillar="Wave" />
<PillarBadge pillar="Trading" active />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "Interactive badges lift with the neo shadow token on hover so the chip reads as clickable before you tap.",
          element: <PillarBadgeHoverState />,
          code: `<PillarBadge
  pillar="Vision"
  interactive
  className="shadow-neo-strong"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Press Tab to move onto a badge; the theme ring outline appears and Space or Enter toggles its active gradient.",
          element: <PillarBadgeFocusState />,
          code: `<PillarBadge
  pillar="Vision"
  interactive
  className="ring-2 ring-[var(--theme-ring)] ring-offset-2 ring-offset-[var(--background)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "Active badges glow with the gradient overlay while `aria-pressed` stays in sync for assistive tech.",
          element: <PillarBadgeActiveState />,
          code: `<PillarBadge pillar="Vision" interactive active />`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "Disable the badge when the underlying pillar cannot change; opacity and pointer locks communicate the frozen state.",
          element: <PillarBadgeDisabledState />,
          code: `<PillarBadge pillar="Vision" interactive disabled />`,
        },
      ],
    },
    {
      id: "pillar-selector",
      name: "PillarSelector",
      element: <PillarSelector />,
      tags: ["pillar", "selector"],
      code: `<PillarSelector />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "Hovering a chip raises the group with the soft neo shadow so the upcoming selection is obvious to pointer users.",
          element: <PillarSelectorHoverState />,
          code: `<PillarSelector
  className="rounded-card p-[var(--space-2)] shadow-[var(--shadow-neo-soft)]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Press Tab to focus the selector; the ring token outlines the tray while Space toggles the focused badge and arrow keys move between pillars.",
          element: <PillarSelectorFocusState />,
          code: `<PillarSelector
  className="rounded-card p-[var(--space-2)] ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "Selected pillars glow with the gradient indicator; Space toggles the highlighted badge without collapsing the row.",
          element: <PillarSelectorActiveState />,
          code: `<PillarSelector value={["Wave", "Trading"]} />`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "Apply the disabled token when review notes are locked so neither pointer nor keyboard input can adjust pillars.",
          element: <PillarSelectorDisabledState />,
          code: `<PillarSelector className="pointer-events-none opacity-[var(--disabled)]" />`,
        },
      ],
    },
    {
      id: "role-selector",
      name: "RoleSelector",
      element: <RoleSelectorDemo />,
      tags: ["role", "selector"],
      code: `<RoleSelector value={role} onChange={setRole} />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "The segmented tray floats with the soft neon shadow on hover so the active lane stays anchored while exploring other roles.",
          element: <RoleSelectorHoverState />,
          code: `<RoleSelector
  value="MID"
  onChange={() => {}}
  className="shadow-[var(--shadow-neo-soft)]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Press Tab to enter the segmented control; the focus token outlines the rail and arrow keys cycle lanes while Space or Enter confirms.",
          element: <RoleSelectorFocusState />,
          code: `<RoleSelector
  value="MID"
  onChange={() => {}}
  className="ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[var(--btn-bg)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "Choosing a lane slides the glitch indicator behind the tab and updates the polite live region for screen readers.",
          element: <RoleSelectorActiveState />,
          code: `<RoleSelector value="BOT" onChange={() => {}} />`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "Dim the control with the disabled opacity token when the review locks so neither pointer nor keyboard events change the selection.",
          element: <RoleSelectorDisabledState />,
          code: `<RoleSelector
  value="MID"
  onChange={() => {}}
  className="pointer-events-none opacity-[var(--disabled)]"
/>`,
        },
      ],
    },
  ],
  components: [
    {
      id: "theme-picker",
      name: "ThemePicker",
      element: <ThemePickerDemo />,
      tags: ["theme", "picker"],
      code: `<ThemePicker variant="lg" onVariantChange={() => {}} />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "The shared hover token fills the trigger so pointer users preview the upcoming theme before selection.",
          element: <ThemePickerHoverState />,
          code: `<ThemePicker
  variant="lg"
  onVariantChange={() => {}}
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "Keyboard focus relies on the global `focus-visible` token, outlining the trigger without introducing extra wrappers.",
          element: <ThemePickerFocusState />,
          code: `<ThemePicker
  variant="lg"
  onVariantChange={() => {}}
  className="ring-2 ring-[var(--focus)]"
  buttonClassName="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "When the dropdown is open we pin the trigger with the shared active token so the current theme remains grounded.",
          element: <ThemePickerActiveState />,
          code: `<ThemePicker
  variant="lg"
  onVariantChange={() => {}}
  buttonClassName="bg-[--active] data-[open=true]:bg-[--active]"
/>`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "The disabled opacity token mutes the control and removes pointer events while preserving the theme label.",
          element: <ThemePickerDisabledState />,
          code: `<ThemePicker variant="lg" onVariantChange={() => {}} disabled />`,
        },
        {
          id: "loading",
          name: "Loading",
          description:
            "List options can mark the active variant as loading to stream theme assets, showing the spinner token inside the dropdown.",
          element: <ThemePickerLoadingState />,
          code: `<ThemePicker
  variant="lg"
  onVariantChange={() => {}}
  loadingVariant="lg"
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
      ],
    },
    {
      id: "background-picker",
      name: "BackgroundPicker",
      element: <BackgroundPickerDemo />,
      tags: ["background", "picker"],
      code: `<BackgroundPicker bg={0} onBgChange={() => {}} />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "The hover fill token mirrors ThemePicker so background previews share the same affordance pattern.",
          element: <BackgroundPickerHoverState />,
          code: `<BackgroundPicker
  bg={0}
  onBgChange={() => {}}
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "The `focus-visible` utility outlines the trigger directly, keeping the indicator consistent with other settings controls.",
          element: <BackgroundPickerFocusState />,
          code: `<BackgroundPicker
  bg={0}
  onBgChange={() => {}}
  className="ring-2 ring-[var(--focus)]"
  buttonClassName="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "While the menu is open we keep the active token applied so the current background is obvious as you explore options.",
          element: <BackgroundPickerActiveState />,
          code: `<BackgroundPicker
  bg={0}
  onBgChange={() => {}}
  buttonClassName="bg-[--active] data-[open=true]:bg-[--active]"
/>`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "Disabled opacity tokens dim the control and swatch preview while removing pointer affordances.",
          element: <BackgroundPickerDisabledState />,
          code: `<BackgroundPicker bg={0} onBgChange={() => {}} disabled />`,
        },
        {
          id: "loading",
          name: "Loading",
          description:
            "When wallpapers stream in, the loading flag shows the spinner token beside the active swatch inside the dropdown.",
          element: <BackgroundPickerLoadingState />,
          code: `<BackgroundPicker
  bg={0}
  onBgChange={() => {}}
  loadingBackground={0}
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
      ],
    },
    {
      id: "settings-select",
      name: "SettingsSelect",
      element: <SettingsSelectDemo />,
      tags: ["select", "settings"],
      code: `<div className="stack-sm">
  <SettingsSelect
    ariaLabel="Theme"
    prefixLabel="Theme"
    items={[{ value: "lg", label: "Glitch" }]}
    value="lg"
  />
  <SettingsSelect
    ariaLabel="Theme (disabled)"
    prefixLabel="Theme (disabled)"
    items={[{ value: "lg", label: "Glitch" }]}
    value="lg"
    disabled
  />
</div>`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "Hover uses the shared token fill so every settings row communicates interactivity the same way.",
          element: <SettingsSelectHoverState />,
          code: `<SettingsSelect
  ariaLabel="Theme"
  prefixLabel="Theme"
  items={[{ value: "lg", label: "Glitch" }, { value: "aurora", label: "Aurora" }]}
  value="lg"
  onChange={() => {}}
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "`focus-visible` keeps the focus ring within the control, matching buttons and toggles in the settings column.",
          element: <SettingsSelectFocusState />,
          code: `<SettingsSelect
  ariaLabel="Theme"
  prefixLabel="Theme"
  items={[{ value: "lg", label: "Glitch" }, { value: "aurora", label: "Aurora" }]}
  value="lg"
  onChange={() => {}}
  className="ring-2 ring-[var(--focus)]"
  buttonClassName="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "An active dropdown keeps the trigger in the shared active fill so you never lose track of the selected row.",
          element: <SettingsSelectActiveState />,
          code: `<SettingsSelect
  ariaLabel="Theme"
  prefixLabel="Theme"
  items={[{ value: "lg", label: "Glitch" }, { value: "aurora", label: "Aurora" }]}
  value="lg"
  onChange={() => {}}
  buttonClassName="bg-[--active] data-[open=true]:bg-[--active]"
/>`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "The global disabled token desaturates the trigger and removes pointer events while keeping the label readable.",
          element: <SettingsSelectDisabledState />,
          code: `<SettingsSelect
  ariaLabel="Theme"
  prefixLabel="Theme"
  items={[{ value: "lg", label: "Glitch" }]}
  value="lg"
  onChange={() => {}}
  disabled
/>`,
        },
        {
          id: "loading",
          name: "Loading",
          description:
            "Individual options can stream data; marking one as loading reveals the spinner token beside the label in the dropdown.",
          element: <SettingsSelectLoadingState />,
          code: `<SettingsSelect
  ariaLabel="Theme"
  prefixLabel="Theme"
  items={[
    { value: "lg", label: "Glitch", loading: true },
    { value: "aurora", label: "Aurora" },
  ]}
  value="lg"
  onChange={() => {}}
  buttonClassName="bg-[--hover] hover:bg-[--hover]"
/>`,
        },
      ],
    },
    {
      id: "theme-toggle",
      name: "ThemeToggle",
      element: <ThemeToggle />,
      tags: ["theme", "toggle"],
      code: `<ThemeToggle />`,
      states: [
        {
          id: "hover",
          name: "Hover",
          description:
            "Applying the hover token to the dropdown trigger keeps the toggle consistent with other select controls.",
          element: <ThemeToggleHoverState />,
          code: `<ThemeToggle
  className="[&_button[aria-haspopup='listbox']]:bg-[--hover] [&_button[aria-haspopup='listbox']]:hover:bg-[--hover]"
/>`,
        },
        {
          id: "focus",
          name: "Focus-visible",
          description:
            "The nested `focus-visible` utility outlines the variant trigger without needing extra DOM wrappers.",
          element: <ThemeToggleFocusState />,
          code: `<ThemeToggle
  className="[&_button[aria-haspopup='listbox']]:outline-none [&_button[aria-haspopup='listbox']]:ring-2 [&_button[aria-haspopup='listbox']]:ring-[var(--focus)] focus-visible:[&_button[aria-haspopup='listbox']]:outline-none focus-visible:[&_button[aria-haspopup='listbox']]:ring-2 focus-visible:[&_button[aria-haspopup='listbox']]:ring-[var(--focus)]"
/>`,
        },
        {
          id: "active",
          name: "Active / selected",
          description:
            "When the variant menu opens we swap to the shared active token so the current selection stays anchored.",
          element: <ThemeToggleActiveState />,
          code: `<ThemeToggle
  className="[&_button[aria-haspopup='listbox']]:bg-[--active] [&_button[aria-haspopup='listbox'][data-open='true']]:bg-[--active] [&_button[aria-haspopup='listbox']]:hover:bg-[--hover]"
/>`,
        },
        {
          id: "disabled",
          name: "Disabled",
          description:
            "Disabling the control mutes both the cycle button and dropdown using the global disabled token.",
          element: <ThemeToggleDisabledState />,
          code: `<ThemeToggle
  cycleDisabled
  className="pointer-events-none opacity-[var(--disabled)]"
/>`,
        },
        {
          id: "loading",
          name: "Loading",
          description:
            "Longer background transitions can show progress by enabling the built-in loading spinner on the cycle button.",
          element: <ThemeToggleLoadingState />,
          code: `<ThemeToggle cycleLoading />`,
        },
      ],
    },
  ],
  misc: [
    {
      id: "cat-companion",
      name: "CatCompanion",
      element: <CatCompanion />,
      tags: ["cat", "companion"],
      code: `<CatCompanion />`,
    },
  ],
};

const gallerySections: GallerySection[] = Object.entries(LEGACY_SPEC_DATA).map(
  ([sectionId, specs]) =>
    defineGallerySection({
      id: sectionId as GallerySectionId,
      entries: specs.map((spec) => ({
        id: spec.id,
        name: spec.name,
        description: spec.description,
        tags: spec.tags,
        props: spec.props?.map(({ label, value }) => ({
          name: label,
          type: value,
        })),
        kind: SECTION_KIND_MAP[sectionId as GallerySectionId] ?? "component",
        preview: createGalleryPreview({
          id: `prompts:${sectionId}:${spec.id}`,
          render: () => spec.element,
        }),
        code: spec.code,
        states: spec.states?.map((state) => ({
          id: state.id,
          name: state.name,
          description: state.description,
          code: state.code,
          preview: createGalleryPreview({
            id: `prompts:${sectionId}:${spec.id}:state:${state.id}`,
            render: () => state.element,
          }),
        })),
        usage: spec.usage,
      })),
    }),
);

export default gallerySections;
