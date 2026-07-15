"use client";

import { Children, isValidElement, useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface SplitHeadlineProps {
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}

// Splits a node's text into <span> words for the stagger reveal, preserving
// any inline elements (e.g. the hero's <span className="glow">) as single
// units so they don't get torn apart word-by-word themselves.
function splitToWords(node: ReactNode, keyPrefix = "w"): ReactNode {
  return Children.map(node, (child, i) => {
    if (typeof child === "string") {
      const words = child.split(/(\s+)/).filter((w) => w.length > 0);
      return words.map((w, j) =>
        /^\s+$/.test(w) ? (
          w
        ) : (
          <span className="split-word" key={`${keyPrefix}-${i}-${j}`}>
            <span className="split-word-inner">{w}</span>
          </span>
        )
      );
    }
    if (isValidElement(child)) {
      // Preserve the element itself (with its own className/style, e.g. the
      // hero's gold "glow" span) as a single reveal unit — only its text
      // content shifted the earlier draft, which silently dropped that
      // styling since it rendered the bare string instead of the element.
      return (
        <span className="split-word" key={`${keyPrefix}-${i}`}>
          <span className="split-word-inner">{child}</span>
        </span>
      );
    }
    return child;
  });
}

/**
 * Headline that reveals word-by-word as it scrolls into view — each word
 * slides up out of a clipped box (no opacity flash, reads as the word
 * being "written in"). Falls back to plain static text for
 * prefers-reduced-motion, so the copy is always immediately legible there.
 */
export function SplitHeadline({ as = "h2", className, children }: SplitHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const words = el.querySelectorAll<HTMLElement>(".split-word-inner");
    if (!words.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const Tag = as;
  return (
    <Tag className={className} ref={ref}>
      {splitToWords(children)}
    </Tag>
  );
}
