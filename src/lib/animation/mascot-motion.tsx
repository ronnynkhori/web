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

const CONFETTI = ["var(--tk-color-brand-red)", "var(--tk-color-brand-yellow)", "var(--tk-color-brand-blue)", "#fff"];

/** A short burst of brand-colour confetti from a point (Web Animations, removed after). */
export function confetti(x: number, y: number) {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:2147483000`;
  for (let i = 0; i < 22; i++) {
    const bit = document.createElement("span");
    const size = 5 + Math.random() * 6;
    const round = i % 3 === 0;
    bit.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${round ? size : size * 0.45}px;border-radius:${round ? "50%" : "1px"};background:${CONFETTI[i % CONFETTI.length]}`;
    layer.append(bit);
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    bit.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540 - 270}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx * 1.15}px,${dy + 70}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" },
    );
  }
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 1500);
}

/**
 * One controller for every mascot on the page (see components/mascot/mascot-actor.tsx):
 * - scroll entrance: [data-mascot="enter"] gets [data-mascot-in] once 25% visible;
 * - tap/click cheer with a confetti burst: [data-mascot-tap] actors are hit-tested by
 *   position, so mascots layered behind text (the hero) still react;
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
      let hitAny = false;
      for (const actor of tappable())
        if (hit(actor, e.clientX, e.clientY)) {
          cheer(actor);
          hitAny = true;
        }
      if (hitAny) confetti(e.clientX, e.clientY);
    };

    const fine = window.matchMedia(FINE_POINTER);
    let frame = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    const untilt = (el: HTMLElement) => ["--tilt-ax", "--tilt-ay", "--tilt-a", "--glare"].forEach((p) => el.style.removeProperty(p));
    const update = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      // [data-tilt] cards lean towards the pointer (axis-angle `rotate`, so hover lifts keep `transform`).
      const card = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-tilt]") : null;
      if (tilted && tilted !== card) untilt(tilted);
      tilted = card;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 2 - 1;
        const py = ((e.clientY - r.top) / r.height) * 2 - 1;
        card.style.setProperty("--tilt-ax", (-py).toFixed(3));
        card.style.setProperty("--tilt-ay", px.toFixed(3));
        card.style.setProperty("--tilt-a", `${(Math.min(1, Math.hypot(px, py)) * 7).toFixed(2)}deg`);
        card.style.setProperty("--glare", `${((px + 1) * 50).toFixed(1)}% ${((py + 1) * 50).toFixed(1)}%`);
      }
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
