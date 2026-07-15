import type * as React from "react";

// <image-slot> is a custom element defined at runtime by public/vendas/image-slot.js
// (loaded via next/script on this route). It isn't part of the standard DOM typings,
// so it needs to be declared here for the JSX below to type-check.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "image-slot": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          shape?: "rect" | "rounded" | "circle" | "pill";
          radius?: number;
          mask?: string;
          fit?: "cover" | "contain";
          placeholder?: string;
          src?: string;
          credit?: string;
          "credit-href"?: string;
        },
        HTMLElement
      >;
    }
  }
}
