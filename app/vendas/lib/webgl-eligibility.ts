// Shared progressive-enhancement gate for the hero's WebGL layers (HeroScene,
// HeroHills): only mount on desktop-sized, non-reduced-motion, WebGL-capable,
// non-data-saver connections, so a slow GPU/connection never pays for a 3D
// layer it won't render well anyway.

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
  const wide = window.matchMedia("(min-width: 900px)").matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  // Only bail on an explicit data-saver flag or the two genuinely-constrained
  // tiers — "3g" alone is excluded from the cutoff because browsers report it
  // as a common, imprecise default (virtualized/CI environments included)
  // and these scenes have near-zero payload (procedural geometry, no textures).
  const slow = nav.connection?.saveData || /^(slow-)?2g$/.test(nav.connection?.effectiveType ?? "");
  return wide && !reduced && !slow && supportsWebGL();
}
