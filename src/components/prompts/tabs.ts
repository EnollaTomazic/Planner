export const PROMPTS_TAB_ITEMS = [
  { key: "chat", label: "ChatGPT" },
  { key: "codex", label: "Codex review" },
  { key: "notes", label: "Notes" },
] as const;

export type PromptsTabKey = (typeof PROMPTS_TAB_ITEMS)[number]["key"];

export const PROMPTS_TAB_ID_BASE = "prompts-tabs" as const;
