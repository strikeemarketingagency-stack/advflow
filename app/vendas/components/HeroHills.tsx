"use client";

import { useState } from "react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { tokens } from "../lib/tokens";
import { computeWebGLEligibility } from "../lib/webgl-eligibility";

interface HeroHillsProps {
  className?: string;
}

/**
 * Full-bleed animated terrain behind the hero copy + product frame. Same
 * progressive-enhancement gate as HeroScene (desktop/motion/WebGL/data-saver)
 * since it's the same cost profile — procedural geometry, no textures, but a
 * per-frame vertex-shader noise pass over a 256x256 plane.
 */
export function HeroHills({ className }: HeroHillsProps) {
  const [eligible] = useState(computeWebGLEligibility);
  const [ready, setReady] = useState(false);

  if (!eligible) return null;

  return (
    <div className={`${className ?? ""}${ready ? " is-ready" : ""}`} aria-hidden="true">
      <GLSLHills color={tokens.color.gold} opacity={0.35} lookAtY={-30} radius={220} onReady={() => setReady(true)} />
    </div>
  );
}
