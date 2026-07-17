"use client";

import { useState } from "react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { tokens } from "../lib/tokens";
import { computeWebGLEligibility } from "../lib/webgl-eligibility";

interface HeroHillsProps {
  className?: string;
}

/**
 * Full-bleed animated terrain behind the hero copy + product frame. Runs on
 * mobile too — same progressive-enhancement gate as HeroScene (motion/WebGL/
 * data-saver), just not gated on viewport width, since this background is
 * meant to show up everywhere, not just desktop.
 */
export function HeroHills({ className }: HeroHillsProps) {
  const [eligible] = useState(computeWebGLEligibility);
  const [ready, setReady] = useState(false);

  if (!eligible) return null;

  return (
    <div className={`${className ?? ""}${ready ? " is-ready" : ""}`} aria-hidden="true">
      <GLSLHills color={tokens.color.gold} opacity={0.35} lookAtY={30} radius={280} onReady={() => setReady(true)} />
    </div>
  );
}
