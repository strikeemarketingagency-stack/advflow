"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ScrollTrigger, gsap } from "../lib/gsap";
import { tokens } from "../lib/tokens";

/**
 * Isometric "dashboard" made of a handful of floating rounded panels at
 * different Z depths — a stand-in for the real Spline scene the brief asked
 * for (no Spline file exists for this project; this gets the same layered,
 * lit, parallax-reactive read using React Three Fiber, which is scriptable
 * end-to-end instead of depending on an externally-authored asset).
 */
function Panels({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    // Mouse parallax: rotate a few degrees toward the cursor.
    const targetY = pointer.x * THREE.MathUtils.degToRad(8);
    const targetX = -pointer.y * THREE.MathUtils.degToRad(6);
    // Scroll: an extra gentle turn as the hero leaves the viewport.
    const scrollTilt = scrollRef.current * THREE.MathUtils.degToRad(10);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY + scrollTilt * 0.4, 4, 0.016);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX - 0.12, 4, 0.016);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -scrollRef.current * 0.6, 4, 0.016);
  });

  // Small gold accent chips only — no large opaque panels. A solid box big
  // enough to read as a "dashboard card" also ends up big enough to blank
  // out the real screenshot underneath (tried it: it just looks like a
  // rendering bug, not a product shot). Floating accents at the frame's
  // edges give the parallax/depth read the brief asked for without ever
  // competing with the actual product image, which stays the honest,
  // legible hero visual.
  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: tokens.color.gold,
        emissive: tokens.color.goldDeep,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.85,
      }),
    []
  );
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: tokens.color.goldBright,
        roughness: 0.15,
        metalness: 0.3,
        transparent: true,
        opacity: 0.22,
      }),
    []
  );

  return (
    <group ref={group} rotation={[-0.12, -0.35, 0]}>
      <RoundedBox args={[0.34, 0.34, 0.07]} radius={0.09} smoothness={4} position={[2.55, 1.1, 0.6]} material={accentMaterial} />
      <RoundedBox args={[0.24, 0.24, 0.06]} radius={0.07} smoothness={4} position={[-2.65, -0.95, 0.5]} material={accentMaterial} />
      <RoundedBox args={[0.18, 0.18, 0.05]} radius={0.05} smoothness={4} position={[2.3, -1.15, 0.85]} rotation={[0.3, 0.4, 0]} material={accentMaterial} />
      <RoundedBox args={[0.55, 0.4, 0.04]} radius={0.06} smoothness={4} position={[-2.4, 1.0, 0.3]} rotation={[0, 0.2, -0.05]} material={glassMaterial} />
      <RoundedBox args={[0.4, 0.3, 0.04]} radius={0.05} smoothness={4} position={[2.5, -0.2, 0.2]} rotation={[0, -0.15, 0.04]} material={glassMaterial} />
    </group>
  );
}

function Scene({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#f6dfae" />
      <pointLight position={[-2, -1, 2]} intensity={0.5} color="#c9a45f" />
      <Panels scrollRef={scrollRef} />
    </>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

interface HeroSceneProps {
  className?: string;
  /** Element to scroll-link the scene's drift against (the hero section). */
  scrollTriggerRef: React.RefObject<HTMLElement | null>;
  onReady?: () => void;
}

/**
 * Progressive-enhancement layer: mounts only on desktop-sized, non-reduced-
 * motion, WebGL-capable, non-data-saver connections. The static hero
 * screenshot underneath is always the real LCP element — this fades in on
 * top of it once the first 3D frame has actually painted, so a slow GPU or
 * failed WebGL context never blocks or delays the hero from being usable.
 */
// This component is only ever mounted client-side (the page loads it via
// next/dynamic with ssr:false), so computing eligibility as a lazy useState
// initializer is safe — no window/navigator access happens during SSR, and
// it avoids an extra render pass (vs. computing it in a mount effect).
function computeEligibility() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 900px)").matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  // Only bail on an explicit data-saver flag or the two genuinely-constrained
  // tiers — "3g" alone is excluded from the cutoff because browsers report it
  // as a common, imprecise default (virtualized/CI environments included)
  // and the scene has near-zero payload (procedural geometry, no textures).
  const slow = nav.connection?.saveData || /^(slow-)?2g$/.test(nav.connection?.effectiveType ?? "");
  return wide && !reduced && !slow && supportsWebGL();
}

export function HeroScene({ className, scrollTriggerRef, onReady }: HeroSceneProps) {
  const [eligible, setEligible] = useState(computeEligibility);
  const scrollRef = useRef(0);

  // One-way downgrade only: a window shrunk below the desktop breakpoint
  // (narrow browser, tablet rotation) drops the scene; it never remounts
  // the WebGL context just because the window grew back.
  useEffect(() => {
    if (!eligible) return;
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (!mq.matches) setEligible(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [eligible]);

  useEffect(() => {
    if (!eligible || !scrollTriggerRef.current) return;
    const st = ScrollTrigger.create({
      trigger: scrollTriggerRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, [eligible, scrollTriggerRef]);

  if (!eligible) return null;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => {
          // First successful frame — safe to reveal (parent fades this container in via CSS class).
          gsap.delayedCall(0.05, () => onReady?.());
        }}
      >
        <Scene scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
