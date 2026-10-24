"use client";

import { useEffect } from "react";

/** Kinds whose hidden state has no visible area (clip-path / scale 0). */
const CLIPPED = new Set(["mask", "image", "stripe"]);

/**
 * One IntersectionObserver for every [data-reveal] element on the page.
 * Reveals run once at 20% visibility and never re-trigger (motion §6).
 * Clipped elements never intersect, so their parent is observed instead.
 */
export function RevealObserver() {
  useEffect(() => {
    const pending = new Map<Element, HTMLElement[]>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const el of pending.get(entry.target) ?? []) el.dataset.revealed = "";
          pending.delete(entry.target);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" },
    );

    const observe = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
        const target = CLIPPED.has(el.dataset.reveal ?? "") && el.parentElement ? el.parentElement : el;
        const list = pending.get(target);
        if (list) {
          if (!list.includes(el)) list.push(el);
          return;
        }
        pending.set(target, [el]);
        io.observe(target);
      });
    observe(document);

    // Pick up client-rendered content (filters, live sections) as it mounts.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && observe(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
