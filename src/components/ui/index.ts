// src/components/ui/index.ts
// Centralized exports so pages import from "@/components/ui" only.
// NOTE: AnimatedSelect is canonical. `Dropdown` is a temporary alias.

//
// Primitives
//
export { default as Button } from "./primitives/button";
export { default as IconButton } from "./primitives/IconButton";
export { default as Input } from "./primitives/input";
export { default as Textarea } from "./primitives/textarea";
export { default as Badge } from "./Badge";
export { default as Pill } from "./primitives/pill";
export { default as SearchBar } from "./primitives/searchbar";
export { GlitchSegmentedGroup, GlitchSegmentedButton } from "./primitives/glitch-segmented";
//
// Feedback
//
export { default as Progress } from "./feedback/Progress";

//
// Theme
//
export { default as ThemeToggle } from "./theme/ThemeToggle";
export { default as AnimationToggle } from "./AnimationToggle";

//
// Toggles
//
export { default as CheckCircle } from "./toggles/CheckCircle";
export { NeonIcon } from "./toggles/NeonIcon";
export { default as Toggle } from "./toggles/toggle";

//
// Layout
//
export { default as SectionCard } from "./layout/SectionCard";
export { default as TitleBar } from "./layout/TitleBar";
export { default as Hero, HeroTabs } from "./layout/Hero";
export { default as Hero2, Hero2Tabs, Hero2SearchBar, Hero2GlitchStyles } from "./layout/Hero2";
export { default as TabBar } from "./layout/TabBar";
export { default as Split } from "./layout/Split";

//
// League
//
export { default as SideSelector } from "./league/SideSelector";
export { default as PillarBadge } from "./league/pillars/PillarBadge";
export { default as PillarSelector } from "./league/pillars/PillarSelector";

//
// Selects (AnimatedSelect is the canonical one)
//
export { default as AnimatedSelect } from "./selects/AnimatedSelect";
// Temporary compatibility alias (remove when old imports are gone):
export { default as Dropdown } from "./selects/AnimatedSelect";
