"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/data/types";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export interface MediaView {
  id: string;
  type: "photo" | "video";
  title: string;
  ratio: "landscape" | "portrait" | "square";
  image?: ImageAsset;
  alt: string;
  credit?: string;
}

type Filter = "all" | "photo" | "video";

const ratioClass = { landscape: "desktop:aspect-[4/3]", portrait: "desktop:aspect-[4/5]", square: "desktop:aspect-square" };
const ease = [0.2, 0, 0, 1] as const;

/**
 * Gallery (motion concept 6). Phones: a swipe row of equal cards. Desktop:
 * masonry columns. Filter chips slide a shared indicator; a photo grows into a
 * full-screen viewer (shared layoutId) with swipe, arrow keys, Escape and a
 * focus trap; focus returns to the photo that opened it.
 */
export function MediaGallery({
  items,
  labels,
  downloadsUrl,
}: {
  items: MediaView[];
  labels: Dictionary["media"];
  downloadsUrl: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const shown = items.filter((m) => filter === "all" || m.type === filter);
  const current = open === null ? null : shown[open];

  const close = useCallback(() => {
    const id = current?.id;
    setOpen(null);
    if (id) requestAnimationFrame(() => triggers.current.get(id)?.focus());
  }, [current]);

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)),
    [shown.length],
  );

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: labels.all },
    { id: "photo", label: labels.photos },
    { id: "video", label: labels.videos },
  ];

  return (
    <LayoutGroup id="media">
      <div role="group" aria-label={labels.filterLabel} className="mb-5 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setOpen(null);
            }}
            className={cn(
              "relative isolate inline-flex min-h-touch items-center rounded-pill px-4 type-label transition-colors duration-ui ease-standard",
              filter === f.id ? "text-on-action-secondary" : "text-fg-2 hover:text-fg",
            )}
          >
            {filter === f.id && (
              <motion.span
                layoutId="media-filter"
                transition={{ duration: 0.24, ease }}
                className="absolute inset-0 -z-10 rounded-pill bg-action-secondary"
              />
            )}
            {f.label}
          </button>
        ))}
      </div>

      <ul
        className={cn(
          "m-0 list-none p-0",
          "mx-[calc(-1*var(--page-margin))] -mt-2 flex snap-x snap-mandatory scroll-px-(--page-margin) gap-3 overflow-x-auto px-(--page-margin) pt-2 pb-2 [scrollbar-width:none]",
          "desktop:mx-0 desktop:mt-0 desktop:block desktop:columns-3 desktop:gap-4 desktop:overflow-visible desktop:px-0 desktop:pt-0",
        )}
      >
        {shown.map((m, i) => (
          <li key={m.id} className="w-[72vw] max-w-80 shrink-0 snap-start tablet:w-[44vw] desktop:mb-4 desktop:w-auto desktop:max-w-none desktop:break-inside-avoid">
            <button
              ref={(el) => {
                if (el) triggers.current.set(m.id, el);
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={fill(labels.open, { title: m.title })}
              className="group relative block w-full overflow-hidden rounded-sm text-left"
            >
              <div className={cn("relative aspect-[4/5] w-full", ratioClass[m.ratio])}>
                {current?.id !== m.id && (
                  <motion.div layoutId={`media-${m.id}`} transition={{ duration: 0.4, ease }} className="absolute inset-0 overflow-hidden">
                    {m.image && (
                      <Image
                        src={m.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 44vw, 72vw"
                        className="media-zoom object-cover"
                        style={m.image.focus ? { objectPosition: m.image.focus } : undefined}
                      />
                    )}
                  </motion.div>
                )}
                <div className="absolute inset-0 scrim-card" aria-hidden="true" />
                {m.type === "video" && (
                  <span className="absolute top-3 right-3 grid size-touch place-items-center rounded-pill bg-surface/80 text-fg" aria-hidden="true">
                    <Icon name="play" size={16} />
                  </span>
                )}
                <p data-theme="dark" className="absolute inset-x-0 bottom-0 m-0 p-4 type-label text-fg">
                  {m.title}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && open !== null && (
          <Lightbox
            key="lightbox"
            item={current}
            index={open}
            total={shown.length}
            onClose={close}
            onStep={step}
            labels={labels}
            downloadsUrl={downloadsUrl}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function Lightbox({
  item,
  index,
  total,
  onClose,
  onStep,
  labels,
  downloadsUrl,
}: {
  item: MediaView;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (d: number) => void;
  labels: Dictionary["media"];
  downloadsUrl: string | null;
}) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dialog.current;
    el?.querySelector<HTMLButtonElement>("[data-close]")?.focus();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "Tab" && el) {
        const focusables = [...el.querySelectorAll<HTMLElement>("button, a[href]")];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [onClose, onStep]);

  return (
    <motion.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-theme="dark"
      data-surface="black"
      className="fixed inset-0 z-modal flex flex-col bg-surface text-fg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease }}
    >
      <div className="flex items-center justify-between gap-4 px-4 pt-[max(env(safe-area-inset-top),var(--tk-space-4))]">
        <p className="m-0 type-label text-fg-muted tabular">{fill(labels.counter, { current: index + 1, total })}</p>
        {downloadsUrl && item.type === "photo" && (
          <a
            href={downloadsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex min-h-touch items-center gap-2 rounded-pill border border-line px-4 type-label text-fg"
          >
            <Icon name="download" size={16} />
            {labels.downloadThis}
          </a>
        )}
        <button
          type="button"
          data-close
          onClick={onClose}
          aria-label={labels.close}
          className="grid size-touch-lg place-items-center rounded-pill border border-line text-fg"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="relative flex-1">
        <motion.div
          layoutId={`media-${item.id}`}
          transition={{ duration: 0.4, ease }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) onStep(1);
            else if (info.offset.x > 80) onStep(-1);
          }}
          className="absolute inset-4 touch-pan-y overflow-hidden desktop:inset-x-10"
        >
          {item.image && <Image src={item.image.src} alt={item.alt} fill sizes="100vw" className="object-contain" draggable={false} />}
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pb-[max(env(safe-area-inset-bottom),var(--tk-space-4))]">
        <button type="button" onClick={() => onStep(-1)} aria-label={labels.prev} className="grid size-touch-lg place-items-center rounded-pill border border-line">
          <Icon name="arrow-left" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="m-0 truncate type-body-m">{item.title}</p>
          {item.credit && <p className="m-0 truncate type-caption text-fg-muted">{fill(labels.credit, { name: item.credit })}</p>}
          {item.type === "video" && <p className="m-0 type-caption text-fg-muted">{labels.noAutoplay}</p>}
        </div>
        <button type="button" onClick={() => onStep(1)} aria-label={labels.next} className="grid size-touch-lg place-items-center rounded-pill border border-line">
          <Icon name="arrow-right" />
        </button>
      </div>
    </motion.div>
  );
}
