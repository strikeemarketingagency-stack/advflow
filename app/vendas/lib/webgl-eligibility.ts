// Shared progressive-enhancement gate for the hero's WebGL layers (HeroScene,
// HeroHills): mounts on any non-reduced-motion, WebGL-capable, non-data-saver
// connection — deliberately not gated on viewport width, since the hills
// background is explicitly meant to run on mobile too, not just desktop.

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export function computeWebGLEligibility() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  // Only bail on an explicit data-saver flag or the two genuinely-constrained
  // tiers — "3g" alone is excluded from the cutoff because browsers report it
  // as a common, imprecise default (virtualized/CI environments included)
  // and these scenes have near-zero payload (procedural geometry, no textures).
  const slow = nav.connection?.saveData || /^(slow-)?2g$/.test(nav.connection?.effectiveType ?? "");
  return !reduced && !slow && supportsWebGL();
}
