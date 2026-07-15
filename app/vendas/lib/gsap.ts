"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once per module load (Next.js dedupes the module instance),
// guarded so a server-side import (shouldn't happen, these files are all
// "use client", but cheap insurance) never touches `window`.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
