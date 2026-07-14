import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-graphite-900 shadow-xs transition-all duration-200 placeholder:text-graphite-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/25 focus-visible:border-gold-500 focus-visible:shadow-[0_0_0_3px_rgba(182,130,53,0.12)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-300 focus-visible:ring-red-200" : "border-mist-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
