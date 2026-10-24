import type { FaqEntry } from "@/data/faq";

export function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

/** Question words that hint at a topic but must never outweigh a topic word. */
const GENERIC = new Set(["when", "where", "quando", "onde", "quand", "start", "begin", "end", "fin", "date", "data", "watch", "free", "live", "local", "lieu", "site", "stay", "access", "events"]);

/**
 * Keyword scoring: whole-word phrase hits, longer phrases weigh more.
 * Returns the best entry, or null when nothing matched.
 */
export function matchFaq<T extends Pick<FaqEntry, "keywords">>(question: string, entries: T[]): T | null {
  const text = normalise(question);
  let best: T | null = null;
  let bestScore = 0;
  for (const entry of entries) {
    let score = 0;
    for (const k of entry.keywords) {
      if (text.includes(` ${k} `)) score += GENERIC.has(k) ? 0.5 : k.split(" ").length * 2 - 1;
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}
