"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CountUpProps {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Counts 0 -> value exactly as the number scrolls into view, once. */
export function CountUp({ value, suffix = "", decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = fmt(value, decimals) + suffix;
      return;
    }
    const obj = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = fmt(obj.n, decimals) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, [value, suffix, decimals, reduced]);

  return (
    <p className={className} ref={ref}>
      0{suffix}
    </p>
  );
}
