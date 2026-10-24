"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./motion-preference";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/** The artwork's box; transparent margins around the pose are not counted. */
function hit(actor: Element, x: number, y: number): boolean {
  const r = (actor.querySelector(".mascot-img") ?? actor).getBoundingClientRect();
  const insetX = r.width * 0.12;
  return x >= r.left + insetX && x <= r.right - insetX && y >= r.top && y <= r.bottom;
}

function cheer(actor: HTMLElement) {
  delete actor.dataset.cheer;
  void actor.offsetWidth; // restart the keyframes on repeat taps
  actor.dataset.cheer = "";
  window.setTimeout(() => delete actor.dataset.cheer, 900);
}

/**
 * One controller for every mascot on the page (see components/mascot/mascot-actor.tsx):
 * - scroll entrance: [data-mascot="enter"] gets [data-mascot-in] once 25% visible;
 * - tap/click cheer: [data-mascot-tap] actors are hit-tested by position, so mascots
 *   layered behind text (the hero) still react;
 * - hover dance (fine pointers): sets [data-hover] on the actor under the pointer;
 * - pointer parallax/lean: [data-mascot-track] areas expose --mx/--my (-1..1).
 * With reduced motion nothing is hidden and no effect runs.
 */
export function MascotMotion() {
  useEffect(() => {
    const reveal = (el: HTMLElement) => (el.dataset.mascotIn = "");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );
    const observe = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>('[data-mascot="enter"]:not([data-mascot-in])').forEach((el) => {
        if (prefersReducedMotion()) reveal(el);
        else io.observe(el);
      });
    observe(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && observe(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const tappable = () => document.querySelectorAll<HTMLElement>("[data-mascot-tap]");

    const onPointerDown = (e: PointerEvent) => {
      if (prefersReducedMotion()) return;
      for (const actor of tappable()) if (hit(actor, e.clientX, e.clientY)) cheer(actor);
    };

    const fine = window.matchMedia(FINE_POINTER);
    let frame = 0;
    let last: PointerEvent | null = null;
    const update = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      for (const actor of tappable()) {
        const over = hit(actor, e.clientX, e.clientY);
        if (over) actor.dataset.hover = "";
        else delete actor.dataset.hover;
      }
      document.querySelectorAll<HTMLElement>("[data-mascot-track]").forEach((area) => {
        const r = area.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        const mx = inside ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0;
        const my = inside ? ((e.clientY - r.top) / r.height) * 2 - 1 : 0;
        area.style.setProperty("--mx", mx.toFixed(3));
        area.style.setProperty("--my", my.toFixed(3));
      });
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!fine.matches || prefersReducedMotion()) return;
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
