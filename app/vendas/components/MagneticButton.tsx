"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface MagneticButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
  onPointerMove?: (e: ReactPointerEvent<HTMLElement>) => void;
  /** Max pixel displacement toward the cursor before it clamps. */
  strength?: number;
}

/**
 * Primary CTA magnetic-hover: the button drifts a few px toward the cursor
 * as it approaches, signalling "click me" without moving so far it risks
 * missing the pointer on release. Capped well below the button's own size
 * so it never drifts out from under a committed click.
 */
export function MagneticButton({ href, className, children, onPointerMove, strength = 14 }: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  if (reduced) {
    return (
      <Link href={href} className={className} onPointerMove={onPointerMove}>
        {children}
      </Link>
    );
  }

  const handleMove = (e: ReactPointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const py = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, px)) * strength);
    y.set(Math.max(-1, Math.min(1, py)) * strength);
    onPointerMove?.(e);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: springX, y: springY, display: "inline-block" }}>
      <Link href={href} className={className} onPointerMove={handleMove} onPointerLeave={handleLeave}>
        {children}
      </Link>
    </motion.div>
  );
}
