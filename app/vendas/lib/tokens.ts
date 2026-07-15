// Design tokens shared between CSS (vendas.css) and JS-driven visuals
// (React Three Fiber scene, canvas-based effects) that can't read CSS
// custom properties directly. Keep in sync with the :root block in
// vendas.css — these are the same values, just available at runtime.

export const tokens = {
  color: {
    surface0: "#0d0b09", // base background
    surface1: "#161310", // elevated panels
    surface2: "#1c1815", // most-elevated / floating cards
    ink: "#f4efe6",
    inkDim: "#c9c2b6",
    inkDimmer: "#8f877c",
    goldBright: "#e9c789",
    gold: "#c9a45f",
    goldDeep: "#8a6423",
    line: "rgba(233,199,137,0.14)",
    lineStrong: "rgba(233,199,137,0.24)",
  },
  // Gradient stops for the "brushed metal" gold treatment.
  goldMetal: ["#f6e3b8", "#d9a94f", "#8a6423"] as const,
} as const;

export type Tokens = typeof tokens;
