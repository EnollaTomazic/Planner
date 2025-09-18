export type Prompt = {
  id: string;
  title?: string;
  text: string;
  createdAt: number;
};

export type PromptWithTitle = Prompt & { title: string };

export type Persona = {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  createdAt: number;
};

export function derivePromptTitle(prompt: Prompt): string {
  if (prompt.title && prompt.title.trim()) return prompt.title.trim();
  const firstLine = (prompt.text || "")
    .split(/\r?\n/)
    .find((line) => line.trim())?.trim();
  return firstLine || "Untitled";
}
