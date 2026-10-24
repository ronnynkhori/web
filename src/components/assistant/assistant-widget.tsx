"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { matchFaq } from "@/lib/faq-match";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export interface AssistantEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  link: { href: string; label: string; external: boolean } | null;
}

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  link?: AssistantEntry["link"];
  suggest?: string[];
}

const ease = [0.2, 0, 0, 1] as const;

/**
 * "Ask the mascot": a floating assistant that answers from the site's own
 * knowledge base (keyword matching, no external AI). Unknown questions get
 * suggested topics and a pointer to the Games guide.
 */
export function AssistantWidget({
  entries,
  suggestions,
  labels,
}: {
  entries: AssistantEntry[];
  suggestions: string[];
  labels: Dictionary["assistant"];
}) {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: labels.greeting, suggest: suggestions }]);
  const nextId = useRef(1);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const byId = new Map(entries.map((e) => [e.id, e]));
  const [overCountdown, setOverCountdown] = useState(false);

  // The launcher would sit on top of the hero countdown digits.
  useEffect(() => {
    const target = document.getElementById("countdown");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setOverCountdown(entry.isIntersecting), { threshold: 0.5 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const push = (m: Omit<Message, "id">) => setMessages((list) => [...list, { ...m, id: nextId.current++ }]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    push({ from: "user", text: q });
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const hit = matchFaq(q, entries);
      if (hit) push({ from: "bot", text: hit.answer, link: hit.link });
      else push({ from: "bot", text: labels.fallback, suggest: suggestions, link: { href: "#guide", label: labels.guideLink, external: false } });
      setTyping(false);
    }, 450);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      <button
        ref={launcher}
        type="button"
        aria-expanded={open}
        aria-controls="assistant-panel"
        onClick={() => setOpen((o) => !o)}
        // Floats over red, black and white sections alike, so it is black with a yellow ring.
        data-theme="dark"
        data-surface="black"
        className={cn(
          "assistant-dock assistant-fab press fixed right-4 z-overlay inline-flex min-h-touch-lg items-center gap-2 rounded-pill border-2 border-action-secondary bg-surface px-4 text-fg shadow-lg transition-[opacity,visibility] duration-ui ease-standard",
          open && "max-tablet:hidden",
          overCountdown && !open && "invisible opacity-0",
        )}
      >
        {open ? (
          <Icon name="close" />
        ) : (
          <span className="assistant-mascot -my-3 -ml-2">
            <Image src="/images/mascot/mascote-2.png" alt="" width={634} height={800} sizes="40px" className="h-[3.25rem] w-auto" />
          </span>
        )}
        <span className="type-label max-tablet:sr-only">{open ? labels.close : labels.open}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="assistant-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="assistant-title"
            data-theme="light"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease }}
            className="assistant-panel fixed inset-x-3 z-overlay flex flex-col overflow-hidden rounded-sm border border-line bg-surface text-fg shadow-lg tablet:inset-x-auto tablet:right-4 tablet:w-[24rem]"
          >
            <header className="flex items-start gap-3 border-b border-line p-4">
              <span className="grid size-touch shrink-0 place-items-center overflow-hidden rounded-pill bg-surface-inverse">
                <Image src="/images/mascot/mascote-1.png" alt="" width={634} height={800} sizes="44px" className="h-[2.5rem] w-auto" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="assistant-title" className="m-0 type-heading-s">
                  {labels.title}
                </h2>
                <p className="m-0 type-caption text-fg-muted">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  launcher.current?.focus();
                }}
                aria-label={labels.close}
                className="grid size-touch shrink-0 place-items-center rounded-pill text-fg-2 hover:text-fg"
              >
                <Icon name="close" />
              </button>
            </header>

            <div ref={log} role="log" aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-2", m.from === "user" ? "items-end" : "items-start")}>
                  <p
                    className={cn(
                      "m-0 max-w-[88%] rounded-sm px-4 py-3 type-body-s",
                      m.from === "user" ? "bg-action-secondary text-on-action-secondary" : "bg-surface-2 text-fg",
                    )}
                  >
                    {m.text}
                  </p>
                  {m.link && (
                    <a
                      href={m.link.href}
                      {...(m.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={() => {
                        if (!m.link?.external && window.matchMedia("(width < 40rem)").matches) setOpen(false);
                      }}
                      className="inline-flex min-h-touch items-center gap-2 type-label text-link hover:underline"
                    >
                      {m.link.label}
                      <Icon name={m.link.external ? "external" : "arrow-right"} size={16} />
                    </a>
                  )}
                  {m.suggest && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={labels.suggestions}>
                      {m.suggest.map((id) => {
                        const entry = byId.get(id);
                        if (!entry) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => ask(entry.question)}
                            className="inline-flex min-h-touch items-center rounded-pill border border-line px-3 type-caption font-semibold text-fg-2 hover:border-accent hover:text-fg"
                          >
                            {entry.question}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <p className="m-0 self-start rounded-sm bg-surface-2 px-4 py-3 type-caption text-fg-muted">{labels.typing}</p>
              )}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line p-3">
              <label htmlFor="assistant-input" className="sr-only">
                {labels.placeholder}
              </label>
              <input
                ref={field}
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={labels.placeholder}
                autoComplete="off"
                className="min-h-touch min-w-0 flex-1 rounded-pill border border-line bg-surface-raised px-4 type-body-s text-fg placeholder:text-fg-muted"
              />
              <button
                type="submit"
                aria-label={labels.send}
                disabled={!input.trim() || typing}
                className="grid size-touch shrink-0 place-items-center rounded-pill bg-action-primary text-on-action-primary disabled:opacity-40"
              >
                <Icon name="send" size={16} />
              </button>
            </form>
            <p className="m-0 px-4 pb-3 type-caption text-fg-muted">{labels.note}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
