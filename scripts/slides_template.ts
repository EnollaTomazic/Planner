export interface SlideOptions {
  /**
   * Display title for the slide.
   */
  title: string;
  /**
   * Supporting text or description that appears below the title.
   */
  text: string;
  /**
   * Path to the image that represents the slide.
   */
  imagePath: string;
}

export interface Slide extends SlideOptions {
  /**
   * Stable identifier used to link slides with navigation controls.
   */
  id: string;
}

export interface SlideDeck {
  /**
   * Identifier for the slide deck; typically derived from the consumer.
   */
  id: string;
  /**
   * Ordered slides that make up the deck.
   */
  slides: Slide[];
}

/**
 * Trim strings and normalise the image path so downstream consumers receive
 * predictable data regardless of how the options were provided.
 */
export function normalizeSlideOptions(options: SlideOptions): SlideOptions {
  const title = options.title.trim();
  const text = options.text.trim();
  const imagePath = normalizeImagePath(options.imagePath);

  if (!title) {
    throw new Error("Slide title is required");
  }

  if (!text) {
    throw new Error("Slide text is required");
  }

  return { title, text, imagePath };
}

function normalizeImagePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error("Slide image path is required");
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Generate a deterministic id using the deck id and the slide title.
 */
export function createSlideId(deckId: string, title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const base = slug || `slide-${index + 1}`;
  return deckId ? `${deckId}-${base}` : base;
}

export function createSlide(deckId: string, index: number, options: SlideOptions): Slide {
  const normalized = normalizeSlideOptions(options);
  return {
    id: createSlideId(deckId, normalized.title, index),
    ...normalized,
  };
}

export function createSlideDeck(deckId: string, slides: SlideOptions[]): SlideDeck {
  const normalizedDeckId = deckId.trim();
  if (!normalizedDeckId) {
    throw new Error("Slide deck id is required");
  }

  return {
    id: normalizedDeckId,
    slides: slides.map((slide, index) => createSlide(normalizedDeckId, index, slide)),
  };
}

export const demoSlideDeck: SlideDeck = createSlideDeck("planner-demo", [
  {
    title: "Strategy sync",
    text: "Align backlog for the Q2 milestone and confirm owners.",
    imagePath: "/hero_image.png",
  },
  {
    title: "Sprint retro",
    text: "Collect insights for the retro and lock the next sprint goals.",
    imagePath: "/hero_image2.png",
  },
  {
    title: "Review window",
    text: "Encourage everyone to log highlights before the week wraps.",
    imagePath: "/planner-logo.svg",
  },
]);
