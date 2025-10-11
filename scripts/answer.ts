import { createSlideDeck, demoSlideDeck, Slide, SlideDeck, SlideOptions } from "./slides_template";

export interface Answer {
  /**
   * Prompt posed to the assistant.
   */
  question: string;
  /**
   * Slides that support the answer.
   */
  deck: SlideDeck;
  /**
   * Short summary derived from the slide titles.
   */
  summary: string;
}

export function summarizeSlides(slides: readonly Slide[]): string {
  if (slides.length === 0) {
    return "No slides configured.";
  }

  return slides.map((slide) => slide.title).join(" \u00b7 ");
}

export function createAnswer(question: string, options: SlideOptions[], deckId = "answer"): Answer {
  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) {
    throw new Error("Question must not be empty");
  }

  const deck = createSlideDeck(deckId, options);
  return {
    question: normalizedQuestion,
    deck,
    summary: summarizeSlides(deck.slides),
  };
}

export function answerToMarkdown(answer: Answer): string {
  const lines = ["# " + answer.question, ""];
  for (const slide of answer.deck.slides) {
    lines.push(`- **${slide.title}**: ${slide.text} _(image: ${slide.imagePath})_`);
  }
  lines.push("", `Summary: ${answer.summary}`);
  return lines.join("\n");
}

export const demoAnswer = createAnswer(
  "How does Planner keep teams aligned?",
  demoSlideDeck.slides.map((slide) => ({
    title: slide.title,
    text: slide.text,
    imagePath: slide.imagePath,
  })),
  "planner-demo-answer",
);
