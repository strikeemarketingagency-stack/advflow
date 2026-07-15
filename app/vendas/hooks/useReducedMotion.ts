"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// Server has no matchMedia; assume motion is fine until hydration confirms
// otherwise (matches how every other "use client" component here already
// treats SSR — the animated variant never renders in the static HTML).
function getServerSnapshot() {
  return false;
}

/** Tracks `prefers-reduced-motion` live so animated components can bail out. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
