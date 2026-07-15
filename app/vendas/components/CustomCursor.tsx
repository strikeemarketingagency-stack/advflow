"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], .card, .plan-card, .testi-card, .logo-slot, .step, input, .acc-trigger";

/**
 * Awwwards-style cursor follower: a small dot with a lagging ring, morphing
 * into a larger "view/click" ring over interactive elements. Desktop
 * fine-pointer only — never mounted on touch devices, and the OS cursor is
 * never hidden until this one has actually painted, so there's no dead
 * zone if it fails to load.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor-active");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onEnter = () => document.documentElement.classList.add("cursor-hover");
    const onLeave = () => document.documentElement.classList.remove("cursor-hover");

    // Delegated so it keeps working across the page's client-rendered
    // reveals/marquee clones instead of needing a listener per element.
    const onOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest?.(INTERACTIVE_SELECTOR)) onEnter();
    };
    const onOut = (e: PointerEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related?.closest?.(INTERACTIVE_SELECTOR)) onLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.classList.remove("custom-cursor-active", "cursor-hover");
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
