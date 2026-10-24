import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { faqSuggestions } from "@/data/faq";
import { getFaq } from "@/lib/cms/read";
import { AssistantWidget, type AssistantEntry } from "./assistant-widget";

/** Localises the knowledge base on the server; the widget only gets strings. */
export async function Assistant({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const faq = await getFaq();
  const entries: AssistantEntry[] = faq.map((e) => ({
    id: e.id,
    keywords: e.keywords,
    question: pick(e.question, locale),
    answer: pick(e.answer, locale),
    link: e.link?.href ? { href: e.link.href, label: pick(e.link.label, locale), external: Boolean(e.link.external) } : null,
  }));
  const ids = new Set(entries.map((e) => e.id));
  return (
    <AssistantWidget
      entries={entries}
      suggestions={faqSuggestions.filter((id) => ids.has(id))}
      labels={dict.assistant}
    />
  );
}
