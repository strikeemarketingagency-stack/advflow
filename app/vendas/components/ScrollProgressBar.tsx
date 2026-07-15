"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Thin gold bar fixed to the top of the viewport, tracking scroll progress through the page. */
export function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(fill, { scaleX: self.progress, transformOrigin: "left center" });
      },
    });
    return () => st.kill();
  }, []);

  if (reduced) return null;

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-fill" ref={fillRef} />
    </div>
  );
}
